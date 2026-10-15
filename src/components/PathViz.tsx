import { ChartLine, Trash2 } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { DataViz } from "./dataviz/DataViz";
import type { EvaluateEach } from "./dataviz/sweep";

type Props = {
  path: string;
  // undefined while `path` isn't a valid dotted path
  segments?: string[];
  suggestions: string[];
  defaultOpen?: boolean;
  current: unknown;
  evaluateEach: EvaluateEach;
  onPathChange: (path: string) => void;
  onDelete: () => void;
};

export function PathViz({
  path,
  segments,
  suggestions,
  defaultOpen,
  current,
  evaluateEach,
  onPathChange,
  onDelete,
}: Props) {
  const listId = useId();
  return (
    <Collapsible defaultOpen={defaultOpen} className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          value={path}
          onChange={(e) => onPathChange(e.target.value)}
          placeholder="input.path"
          list={listId}
          aria-invalid={!segments}
          className="h-7 w-64 font-mono text-xs"
        />
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <CollapsibleTrigger
          render={<Button variant="ghost" size="xs" />}
          className="text-xs"
        >
          <ChartLine />
          Visualize
        </CollapsibleTrigger>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Delete visualization"
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
      </div>
      <CollapsibleContent>
        {segments ? (
          <DataViz current={current} evaluateEach={evaluateEach} />
        ) : (
          <p className="text-xs text-slate-500">
            Enter a dotted path, e.g. ul.registrationDate
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
