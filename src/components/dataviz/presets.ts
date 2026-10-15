import { formatDay, toDay } from "./date";
import type { DateVizConfig } from "./DateViz";
import type { NumberVizConfig } from "./NumberViz";

export type Preset<C> = { label: string; config: () => C };

export const NUMBER_PRESETS: Preset<NumberVizConfig>[] = [
  { label: "0–100", config: () => ({ start: 0, end: 100, step: 1 }) },
  { label: "0.0–1.0", config: () => ({ start: 0, end: 1, step: 0.01 }) },
  {
    label: "0–10M",
    config: () => ({ start: 0, end: 10_000_000, step: 10_000 }),
  },
];

function pastMonths(months: number, stepDays: number): () => DateVizConfig {
  return () => {
    const end = new Date(toDay(formatDay(Date.now())) ?? 0);
    const start = new Date(end);
    start.setUTCMonth(start.getUTCMonth() - months);
    return {
      start: formatDay(start.getTime()),
      end: formatDay(end.getTime()),
      stepDays,
    };
  };
}

export const DATE_PRESETS: Preset<DateVizConfig>[] = [
  { label: "Past 10 years", config: pastMonths(120, 30) },
  { label: "Past year", config: pastMonths(12, 7) },
  { label: "Past month", config: pastMonths(1, 1) },
];

export function isSameConfig<C extends object>(a: C, b: C) {
  return (Object.keys(a) as (keyof C)[]).every((k) => a[k] === b[k]);
}
