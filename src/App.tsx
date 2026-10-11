import Editor from "@monaco-editor/react";
import { evaluate, type MahoragaError } from "mahoraga-js";
import { useMemo, useState } from "react";
import { sampleMatrix } from "./defaultMarix";
import { type ExprError, ExprEditor } from "./ExprEditor";
import { makeFns } from "./fns";
import sampleJson from "./sample.json?raw";

export type Row = { name: string; expr: string; output: boolean };

// JS functions visible to expressions
function makeCtxFns(input: Record<string, unknown>) {
  function adder(n: number, mahoraga_closure: (n: number) => number) {
    console.log("Hi from javascript!");
    let result = mahoraga_closure(n);
    console.log(`moharaga result: ${result}`);
    return (add: number) => result + add;
  }

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
    adder,
  };
}

function run(
  input: Record<string, unknown>,
  fns: ReturnType<typeof makeCtxFns>,
  rows: Row[],
) {
  const ctx = { ...input, ...fns };
  // every row's value, visible to later rows as `prev_risks`
  const risks: Record<string, number> = {};
  // only rows marked as output
  const out: Record<string, number> = {};
  const errors: Record<number, ExprError> = {};
  rows.forEach((r, i) => {
    try {
      const v = evaluate(r.expr, { ...ctx, prev_risks: { ...risks } });
      risks[r.name] = v == null ? 0 : Number(v);
    } catch (e) {
      const err = e as Partial<MahoragaError> & Error;
      risks[r.name] = 0;
      errors[i] = {
        message: `${err.name}: ${err.message}${err.help ? ` (${err.help})` : ""}`,
        span: err.span,
      };
    }
    if (r.output) out[r.name] = risks[r.name];
  });
  const total = Object.values(out).reduce((a, b) => a + b, 0);
  return { risks, out, errors, total };
}

export default function App() {
  const [json, setJson] = useState(sampleJson);
  const [rows, setRows] = useState(sampleMatrix);

  const parsed = useMemo(() => {
    try {
      return { input: JSON.parse(json), error: null };
    } catch (e) {
      return { input: {}, error: (e as Error).message };
    }
  }, [json]);

  const fns = useMemo(() => makeCtxFns(parsed.input), [parsed]);
  const { risks, out, errors, total } = useMemo(
    () => run(parsed.input, fns, rows),
    [parsed, fns, rows],
  );

  const update = (i: number, patch: Partial<Row>) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="grid min-h-screen grid-cols-1 gap-4 bg-slate-50 p-4 text-sm text-slate-800 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_24rem]">
      <section className="flex min-h-0 flex-col gap-2 lg:col-span-2">
        <h2 className="font-semibold">Matrix</h2>
        <div className="flex flex-col gap-2">
          {rows.map((r, i) => (
            <div
              // biome-ignore lint: Let it be, i forgot why it is bad thing to do
              key={i}
              className="flex items-start gap-3 rounded border border-slate-300 bg-white p-2"
            >
              <div className="flex w-56 shrink-0 flex-col gap-1">
                <input
                  className="rounded border border-slate-300 px-1 py-0.5 font-medium"
                  value={r.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                />
                <span
                  className={`font-mono text-lg ${errors[i] || Number.isNaN(risks[r.name]) ? "text-red-600" : ""}`}
                >
                  = {String(risks[r.name])}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <ExprEditor
                  path={`row-${i}.mhr`}
                  value={r.expr}
                  onChange={(expr) => update(i, { expr })}
                  error={errors[i]}
                  ctx={{
                    input: parsed.input,
                    fns,
                    prevRisks: Object.fromEntries(
                      rows.slice(0, i).map((p) => [p.name, risks[p.name]]),
                    ),
                  }}
                />
                {errors[i] && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors[i].message}
                  </p>
                )}
              </div>
              <input
                type="checkbox"
                title="Include in output"
                className="mt-1"
                checked={r.output}
                onChange={(e) => update(i, { output: e.target.checked })}
              />
              <button
                type="button"
                className="text-slate-400 hover:text-red-600"
                onClick={() => setRows(rows.filter((_, j) => j !== i))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="self-start rounded bg-slate-800 px-3 py-1 text-white hover:bg-slate-700"
          onClick={() =>
            setRows([
              ...rows,
              { name: `metric_${rows.length + 1}`, expr: "0", output: true },
            ])
          }
        >
          Add row
        </button>
      </section>

      <section className="flex min-h-0 flex-col gap-2">
        <h2 className="font-semibold">Input</h2>
        <div className="min-h-64 flex-1 overflow-hidden rounded border border-slate-300 bg-white">
          <Editor
            path="input.json"
            language="json"
            value={json}
            onChange={(v) => setJson(v ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        {parsed.error && <p className="text-red-600">{parsed.error}</p>}
      </section>

      <section className="flex min-h-0 flex-col gap-2">
        <h2 className="font-semibold">Output</h2>
        <div className="rounded border border-slate-300 bg-white p-3">
          <div className="text-xs text-slate-500">Total risk score</div>
          <div className="text-3xl font-bold">{total.toFixed(2)}</div>
        </div>
        <pre className="flex-1 overflow-auto rounded border border-slate-300 bg-white p-2 font-mono text-xs">
          {JSON.stringify(out, null, 2)}
        </pre>
      </section>
    </div>
  );
}
