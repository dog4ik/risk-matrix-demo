import Editor, { type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { useEffect, useState } from "react";
import { type ExprCtx, exprCtx, unknownFields } from "./monaco/completion";
import { LANG } from "./monaco/language";

export type ExprError = { message: string; span?: [number, number] };

type Props = {
  path: string;
  value: string;
  onChange: (value: string) => void;
  error?: ExprError;
  ctx: ExprCtx;
};

const OPTIONS: Monaco.editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  lineNumbers: "off",
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 4,
  scrollBeyondLastLine: false,
  scrollbar: { alwaysConsumeMouseWheel: false, vertical: "hidden" },
  overviewRulerLanes: 0,
  renderLineHighlight: "none",
  wordWrap: "on",
  automaticLayout: true,
  fixedOverflowWidgets: true,
  fontSize: 13,
  padding: { top: 6, bottom: 6 },
};

export function ExprEditor({ path, value, onChange, error, ctx }: Props) {
  const [height, setHeight] = useState(40);
  const [mounted, setMounted] = useState<{
    editor: Monaco.editor.IStandaloneCodeEditor;
    monaco: typeof Monaco;
  }>();

  const onMount: OnMount = (editor, monaco) => {
    editor.onDidContentSizeChange((e) =>
      setHeight(Math.max(40, e.contentHeight)),
    );
    setMounted({ editor, monaco });
  };

  const model = mounted?.editor.getModel();
  const uri = model?.uri.toString();

  useEffect(() => {
    if (uri) exprCtx.set(uri, ctx);
  }, [uri, ctx]);

  useEffect(() => {
    if (!mounted || !model) return;
    const { monaco } = mounted;
    const range = (start: number, end: number) => {
      // a zero-width span would render no squiggle
      if (end <= start) end = Math.min(start + 1, value.length);
      if (end <= start) start = Math.max(0, end - 1);
      const s = model.getPositionAt(start);
      const e = model.getPositionAt(end);
      return {
        startLineNumber: s.lineNumber,
        startColumn: s.column,
        endLineNumber: e.lineNumber,
        endColumn: e.column,
      };
    };
    const markers: Monaco.editor.IMarkerData[] = unknownFields(value, ctx).map(
      (w) => ({
        severity: monaco.MarkerSeverity.Warning,
        message: w.message,
        ...range(...w.span),
      }),
    );
    if (error) {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: error.message,
        ...range(...(error.span ?? [0, value.length])),
      });
    }
    monaco.editor.setModelMarkers(model, LANG, markers);
  }, [mounted, model, value, error, ctx]);

  return (
    <div
      className="overflow-hidden rounded border border-slate-300"
      style={{ height }}
    >
      <Editor
        path={path}
        language={LANG}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={onMount}
        options={OPTIONS}
      />
    </div>
  );
}
