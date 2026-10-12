import { evaluate, type MahoragaError } from "mahoraga-js";
import { useMemo, useState } from "react";
import type { ExprError } from "./components/ExprEditor";
import { JsonEditor } from "./components/JsonEditor";
import { Section } from "./components/Section";
import { SettingsBar } from "./components/SettingsBar";
import { overallRisk, uiIndicators } from "./lib/defaultMarix";
import { makeFns } from "./lib/fns";
import sampleJson from "./sample.json?raw";

export type Field = { key: string; label: string; expr: string };

export type Fns = ReturnType<typeof makeCtxFns>;
export type SectionResult = ReturnType<typeof evalSection>;

// JS functions visible to expressions
function makeCtxFns(input: Record<string, unknown>) {
  return {
    ...makeFns(new Date(String(input.currentDateTime))),
    substr_mapping: (key: string, input: Record<string, number>) => {
      if (typeof input !== "object") {
        throw Error("argument should be object");
      }
      if (typeof key !== "string") {
        throw Error("second argument should string");
      }
      key = key.toLowerCase();

      let keys = Object.keys(input).sort((a, b) => b.length - a.length);
      for (const mappingKey of keys) {
        if (key.includes(mappingKey.toLowerCase())) {
          return input[mappingKey];
        }
      }
    },
  };
}

function evalSection(
  input: Record<string, unknown>,
  fns: Fns,
  fields: Field[],
  seen: Record<string, unknown>,
) {
  const ctx = { ...input, ...fns };
  const values: Record<string, unknown> = {};
  const visible: Record<string, unknown>[] = [];
  const errors: Record<number, ExprError> = {};
  fields.forEach((f, i) => {
    const prev = { ...seen, ...values };
    visible.push(prev);
    values[f.key] = undefined;
    if (!f.expr.trim()) return;
    try {
      values[f.key] = evaluate(f.expr, { ...ctx, prev_risks: prev });
    } catch (e) {
      const err = e as Partial<MahoragaError> & Error;
      errors[i] = {
        message: `${err.name}: ${err.message}${err.help ? ` (${err.help})` : ""}`,
        span: err.span,
      };
    }
  });
  return { values, visible, errors };
}

// void and null both become null in the output
const toJson = (values: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v ?? null]));

export default function App() {
  const [json, setJson] = useState(sampleJson);
  const [indicators, setIndicators] = useState(uiIndicators);
  const [overall, setOverall] = useState(overallRisk);

  const parsed = useMemo(() => {
    try {
      return { input: JSON.parse(json), error: null };
    } catch (e) {
      return { input: {}, error: (e as Error).message };
    }
  }, [json]);

  const fns = useMemo(() => makeCtxFns(parsed.input), [parsed]);
  const indicatorsResult = useMemo(
    () => evalSection(parsed.input, fns, indicators, {}),
    [parsed, fns, indicators],
  );
  // overall risks see every ui indicator
  const overallResult = useMemo(
    () => evalSection(parsed.input, fns, overall, indicatorsResult.values),
    [parsed, fns, overall, indicatorsResult],
  );

  const out = {
    ui_indicators: toJson(indicatorsResult.values),
    overall_risk: toJson(overallResult.values),
  };

  const setExpr =
    (fields: Field[], set: (f: Field[]) => void) => (i: number, expr: string) =>
      set(fields.map((f, j) => (j === i ? { ...f, expr } : f)));

  return (
    <div className="grid min-h-screen grid-cols-1 gap-4 bg-slate-50 p-4 text-sm text-slate-800 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_auto_auto_24rem]">
      <SettingsBar />
      <Section
        title="UI indicators"
        id="ui"
        fields={indicators}
        result={indicatorsResult}
        input={parsed.input}
        fns={fns}
        onChange={setExpr(indicators, setIndicators)}
      />
      <Section
        title="Overall risk"
        id="overall"
        fields={overall}
        result={overallResult}
        input={parsed.input}
        fns={fns}
        onChange={setExpr(overall, setOverall)}
      />

      <section className="flex min-h-0 flex-col gap-2">
        <h2 className="font-semibold">Input</h2>
        <div className="min-h-64 flex-1 overflow-hidden rounded border border-slate-300 bg-white">
          <JsonEditor value={json} onChange={setJson} />
        </div>
        {parsed.error && <p className="text-red-600">{parsed.error}</p>}
      </section>

      <section className="flex min-h-0 flex-col gap-2">
        <h2 className="font-semibold">Output</h2>
        <pre className="flex-1 overflow-auto rounded border border-slate-300 bg-white p-2 font-mono text-xs">
          {JSON.stringify(out, null, 2)}
        </pre>
      </section>
    </div>
  );
}
