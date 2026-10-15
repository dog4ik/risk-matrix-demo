import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SweepChart } from "./SweepChart";
import { type EvaluateEach, sweep } from "./sweep";

export type NumberVizConfig = {
  start: number;
  end: number;
  step: number;
};

type ConfigProps = {
  config: NumberVizConfig;
  onChange: (config: NumberVizConfig) => void;
};

export function NumberVizConfigEditor({ config, onChange }: ConfigProps) {
  return (
    <div className="flex gap-2">
      {(["start", "end", "step"] as const).map((k) => (
        <div key={k} className="flex flex-col gap-1">
          <Label className="text-xs capitalize">{k}</Label>
          <Input
            type="number"
            className="h-7 w-24"
            value={config[k]}
            onChange={(e) =>
              onChange({ ...config, [k]: e.target.valueAsNumber })
            }
          />
        </div>
      ))}
    </div>
  );
}

type Props = NumberVizConfig & {
  current: unknown;
  evaluateEach: EvaluateEach;
};

// Plots the expression result while the value at the path sweeps start..end
export function NumberViz({ start, end, step, current, evaluateEach }: Props) {
  return (
    <SweepChart
      sweep={sweep(start, end, step, (x) => x, evaluateEach)}
      current={typeof current === "number" ? current : undefined}
    />
  );
}
