import type { Outcome } from "@/lib/engine";

export const MAX_POINTS = 1000;

export type Sweep = {
  points: { x: number; y: number | null }[];
  failed: number;
  truncated: boolean;
};

// Expression results are plotted as numbers; anything else leaves a gap
function toY(v: unknown) {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "boolean") return v ? 1 : 0;
  return null;
}

// Evaluates the expression once per value put at the path, in one batch so
// the shared engine is set up and restored once per sweep.
export type EvaluateEach = (values: unknown[]) => Outcome[];

export function sweep(
  start: number,
  end: number,
  step: number,
  toValue: (x: number) => unknown,
  evaluateEach: EvaluateEach,
): Sweep | null {
  if (!(step > 0) || !(end >= start)) return null;
  const count = Math.floor((end - start) / step) + 1;
  // avoid accumulating float error from repeated `x += step`
  const xs = Array.from({ length: Math.min(count, MAX_POINTS) }, (_, i) =>
    Number((start + i * step).toPrecision(12)),
  );
  const outcomes = evaluateEach(xs.map(toValue));
  const points = xs.map((x, i) => {
    const o = outcomes[i];
    return { x, y: o.ok ? toY(o.value) : null };
  });
  const failed = outcomes.filter((o) => !o.ok).length;
  return { points, failed, truncated: count > MAX_POINTS };
}
