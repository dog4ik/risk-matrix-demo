import type { Field } from "../App";
import type { ExprCtx } from "../lib/monaco/completion";
import { dottedPath, getPaths } from "../lib/path";
import { ExprEditor, type ExprError } from "./ExprEditor";

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
  const paths = getPaths(field.expr);
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
        {paths.paths.map(dottedPath).map((path, i) => (
          <span key={i}>{path}</span>
        ))}
      </div>
    </div>
  );
}
