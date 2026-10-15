import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Field } from "../App";
import { useEngine } from "../context/EngineContext";
import { evaluateEach } from "../lib/engine";
import type { ExprCtx } from "../lib/monaco/completion";
import { getPath, parseDotted, uniquePaths } from "../lib/path";
import { ExprEditor, type ExprError } from "./ExprEditor";
import { PathViz } from "./PathViz";

type VizItem = { id: string; path: string; open?: boolean };

const vizItem = (path: string, open?: boolean): VizItem => ({
  id: crypto.randomUUID(),
  path,
  open,
});

const display = (v: unknown) =>
  v === undefined ? "void" : (JSON.stringify(v) ?? String(v));

type Props = {
  path: string;
  field: Field;
  value: unknown;
  error?: ExprError;
  ctx: ExprCtx;
  onChange: (expr: string) => void;
};

export function SectionField({
  path,
  field,
  value,
  error,
  ctx,
  onChange,
}: Props) {
  const engine = useEngine();
  // what the expression sees in App, minus the context functions
  const scope = { ...ctx.input, prev_risks: ctx.prevRisks };
  const evaluateAt = (segments: string[]) => (values: unknown[]) =>
    evaluateEach(
      engine,
      field.expr,
      ctx.prevRisks,
      segments,
      getPath(scope, segments.slice(0, 1)),
      values,
    );

  // detected paths, empty while the expression doesn't parse
  const detected = uniquePaths(field.expr).map((p) => p.dotted);
  // owned here rather than derived from `detected`, so a broken expression
  // doesn't throw away visualizations and their configs
  const [vizItems, setVizItems] = useState(() =>
    detected.map((path) => vizItem(path)),
  );
  const updateViz = (id: string, path: string) =>
    setVizItems((items) =>
      items.map((v) => (v.id === id ? { ...v, path } : v)),
    );
  const deleteViz = (id: string) =>
    setVizItems((items) => items.filter((v) => v.id !== id));
  const addViz = () => {
    const used = new Set(vizItems.map((v) => v.path));
    const next = detected.find((p) => !used.has(p)) ?? "";
    setVizItems((items) => [...items, vizItem(next, true)]);
  };

  return (
    <div className="flex items-start gap-3 rounded border border-slate-300 bg-white p-2">
      <div className="flex w-56 shrink-0 flex-col gap-1">
        <span className="font-medium">{field.label}</span>
        <span className="font-mono text-xs text-slate-500">{field.key}</span>
        <span
          className={`font-mono text-lg ${error ? "text-red-600" : value === undefined ? "text-slate-400" : ""}`}
        >
          = {display(value)}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <ExprEditor
          path={path}
          value={field.expr}
          onChange={onChange}
          error={error}
          ctx={ctx}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
        {vizItems.map(({ id, path: vizPath, open }) => {
          const segments = parseDotted(vizPath);
          return (
            <PathViz
              key={id}
              path={vizPath}
              segments={segments}
              suggestions={detected}
              defaultOpen={open}
              current={segments && getPath(scope, segments)}
              evaluateEach={segments ? evaluateAt(segments) : () => []}
              onPathChange={(p) => updateViz(id, p)}
              onDelete={() => deleteViz(id)}
            />
          );
        })}
        <Button
          variant="ghost"
          size="xs"
          className="mt-1 self-start text-xs"
          onClick={addViz}
        >
          <Plus />
          Add visualization
        </Button>
      </div>
    </div>
  );
}
