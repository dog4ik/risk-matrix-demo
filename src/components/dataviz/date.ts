import type { DateVizConfig } from "./DateViz";

export const DAY = 86_400_000;
export const DATE_PART = /^(\d{4})-(\d{2})-(\d{2})/;

// Dates are handled as UTC midnights so the local timezone never shifts a day
export function toDay(s: unknown): number | undefined {
  if (typeof s !== "string") return undefined;
  const m = DATE_PART.exec(s);
  const ms = m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : Date.parse(s);
  return Number.isNaN(ms) ? undefined : ms;
}

export const formatDay = (ms: number) =>
  new Date(ms).toISOString().slice(0, 10);

export function defaultDateConfig(current: unknown): DateVizConfig {
  const center = toDay(current) ?? toDay(formatDay(Date.now())) ?? 0;
  return {
    start: formatDay(center - 365 * DAY),
    end: formatDay(center + 365 * DAY),
    stepDays: 1,
  };
}
