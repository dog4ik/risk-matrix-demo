import type { Field, Fns, SectionResult } from "../App";
import { SectionField } from "./SectionField";

type Props = {
  title: string;
  id: string;
  fields: Field[];
  result: SectionResult;
  input: Record<string, unknown>;
  fns: Fns;
  onChange: (i: number, expr: string) => void;
};

export function Section({
  title,
  id,
  fields,
  result,
  input,
  fns,
  onChange,
}: Props) {
  const { values, visible, errors } = result;
  return (
    <section className="flex min-h-0 flex-col gap-2 lg:col-span-2">
      <h2 className="font-semibold">{title}</h2>
      <div className="flex flex-col gap-2">
        {fields.map((f, i) => (
          <SectionField
            key={f.key}
            path={`${id}-${f.key}.mhr`}
            field={f}
            value={values[f.key]}
            error={errors[i]}
            ctx={{ input, fns, prevRisks: visible[i] }}
            onChange={(expr) => onChange(i, expr)}
          />
        ))}
      </div>
    </section>
  );
}
