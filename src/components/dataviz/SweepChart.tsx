import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MAX_POINTS, type Sweep } from "./sweep";

const chartConfig = {
  y: { label: "Score", color: "var(--color-blue-600)" },
} satisfies ChartConfig;

type Props = {
  sweep: Sweep | null;
  // x of the value currently in the input, marked with a dashed line
  current?: number;
  formatX?: (x: number) => string;
};

export function SweepChart({ sweep, current, formatX = String }: Props) {
  if (!sweep) {
    return (
      <p className="text-xs text-red-600">
        Invalid range: step must be positive and end ≥ start
      </p>
    );
  }
  const { points, failed, truncated } = sweep;

  return (
    <div className="flex flex-col gap-1">
      <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
        <LineChart data={points} margin={{ left: 0, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="x"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatX}
          />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, p) => `x = ${formatX(p[0]?.payload.x)}`}
              />
            }
          />
          {current !== undefined && (
            <ReferenceLine x={current} strokeDasharray="4 4" />
          )}
          <Line
            dataKey="y"
            type="linear"
            stroke="var(--color-y)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
      {(failed > 0 || truncated) && (
        <p className="text-xs text-amber-600">
          {failed > 0 && `${failed} point(s) failed to evaluate. `}
          {truncated && `Showing the first ${MAX_POINTS} points.`}
        </p>
      )}
    </div>
  );
}
