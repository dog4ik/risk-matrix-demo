import { Editor } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { useState } from "react";
import { useVimMode } from "../lib/monaco/useVimMode";

type Props = { value: string; onChange: (val: string) => void };

export function JsonEditor({ value, onChange }: Props) {
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor>();
  useVimMode(editor);
  return (
    <Editor
      path="input.json"
      language="json"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      onMount={setEditor}
      options={{
        minimap: { enabled: false },
        fontSize: 12,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}
