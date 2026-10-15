import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateViz, type DateVizConfig, DateVizConfigEditor } from "./DateViz";
import { defaultDateConfig } from "./date";
import {
  NumberViz,
  type NumberVizConfig,
  NumberVizConfigEditor,
} from "./NumberViz";
import type { EvaluateEach } from "./sweep";

export type DataType = "number" | "string" | "boolean" | "date";

const DATA_TYPES: { value: DataType; label: string }[] = [
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
];

// one config per data type, so switching back and forth keeps edits
type Configs = { number: NumberVizConfig; date: DateVizConfig };

function defaultNumberConfig(current: unknown): NumberVizConfig {
  const c = typeof current === "number" ? current : 0;
  const end = c > 100 ? Math.ceil(c * 2) : 100;
  return { start: 0, end, step: end / 100 };
}

function inferType(v: unknown): DataType {
  if (typeof v === "string") {
    return Number.isNaN(Date.parse(v)) ? "string" : "date";
  }
  if (typeof v === "boolean") return "boolean";
  return "number";
}

type Props = {
  current: unknown;
  evaluateEach: EvaluateEach;
};

export function DataViz({ current, evaluateEach }: Props) {
  const [type, setType] = useState<DataType>(() => inferType(current));
  const [configs, setConfigs] = useState<Configs>(() => ({
    number: defaultNumberConfig(current),
    date: defaultDateConfig(current),
  }));

  const body = () => {
    switch (type) {
      case "number": {
        return (
          <>
            <NumberVizConfigEditor
              config={configs.number}
              onChange={(number) => setConfigs({ ...configs, number })}
            />
            <NumberViz
              {...configs.number}
              current={current}
              evaluateEach={evaluateEach}
            />
          </>
        );
      }
      case "date":
        return (
          <>
            <DateVizConfigEditor
              config={configs.date}
              onChange={(date) => setConfigs({ ...configs, date })}
            />
            <DateViz
              {...configs.date}
              current={current}
              evaluateEach={evaluateEach}
            />
          </>
        );
      case "string":
      case "boolean":
        return (
          <p className="text-xs text-slate-500">
            {type} visualization is not implemented yet
          </p>
        );
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded border border-slate-200 bg-slate-50 p-2">
      <div className="flex items-center gap-2">
        <Label className="text-xs">Data type</Label>
        <Select
          items={DATA_TYPES}
          value={type}
          onValueChange={(v) => v && setType(v)}
        >
          <SelectTrigger size="sm" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATA_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto font-mono text-xs text-slate-500">
          current = {current === undefined ? "void" : JSON.stringify(current)}
        </span>
      </div>
      {body()}
    </div>
  );
}
