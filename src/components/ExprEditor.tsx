import Editor, { type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { useEffect, useState } from "react";
import { type ExprCtx, exprCtx } from "../lib/monaco/completion";
import { LANG } from "../lib/monaco/language";
import { useVimMode } from "../lib/monaco/useVimMode";

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
  wordBasedSuggestions: "off",
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
    const markers: Monaco.editor.IMarkerData[] = [];
    if (error) {
      const [start, end] = error.span ?? [0, value.length];
      // monaco widens an empty range to the word at that position
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: error.message,
        ...monaco.Range.fromPositions(
          model.getPositionAt(start),
          model.getPositionAt(end),
        ),
      });
    }
    monaco.editor.setModelMarkers(model, LANG, markers);
  }, [mounted, model, value, error]);

  useVimMode(mounted?.editor);

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
