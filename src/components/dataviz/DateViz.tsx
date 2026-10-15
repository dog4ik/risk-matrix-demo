import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DATE_PART, DAY, formatDay, toDay } from "./date";
import { SweepChart } from "./SweepChart";
import { type EvaluateEach, sweep } from "./sweep";

export type DateVizConfig = {
  // YYYY-MM-DD, as produced by <input type="date">
  start: string;
  end: string;
  stepDays: number;
};

type ConfigProps = {
  config: DateVizConfig;
  onChange: (config: DateVizConfig) => void;
};

export function DateVizConfigEditor({ config, onChange }: ConfigProps) {
  return (
    <div className="flex gap-2">
      {(["start", "end"] as const).map((k) => (
        <div key={k} className="flex flex-col gap-1">
          <Label className="text-xs capitalize">{k}</Label>
          <Input
            type="date"
            className="h-7 w-36"
            value={config[k]}
            onChange={(e) => onChange({ ...config, [k]: e.target.value })}
          />
        </div>
      ))}
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Step (days)</Label>
        <Input
          type="number"
          className="h-7 w-24"
          value={config.stepDays}
          onChange={(e) =>
            onChange({ ...config, stepDays: e.target.valueAsNumber })
          }
        />
      </div>
    </div>
  );
}

type Props = DateVizConfig & {
  current: unknown;
  evaluateEach: EvaluateEach;
};

// Plots the expression result while the date at the path sweeps start..end
export function DateViz({
  start,
  end,
  stepDays,
  current,
  evaluateEach,
}: Props) {
  // keep the input's format, e.g. "1991-06-20T00:00:00" stays date-time
  const suffix =
    typeof current === "string" && DATE_PART.test(current)
      ? current.replace(DATE_PART, "")
      : "";
  const startMs = toDay(start);
  const endMs = toDay(end);
  const result =
    startMs === undefined || endMs === undefined
      ? null
      : sweep(
          startMs,
          endMs,
          stepDays * DAY,
          (x) => formatDay(x) + suffix,
          evaluateEach,
        );

  return (
    <SweepChart sweep={result} current={toDay(current)} formatX={formatDay} />
  );
}
