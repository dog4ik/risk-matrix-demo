import type * as Monaco from "monaco-editor";
import { initVimMode } from "monaco-vim";
import { useEffect } from "react";
import { useEditorSettingsContext } from "../../context/EditorSettingsContext";

export function useVimMode(editor?: Monaco.editor.IStandaloneCodeEditor) {
  const { settings } = useEditorSettingsContext();
  useEffect(() => {
    if (!editor || !settings.vimMode) return;
    const vim = initVimMode(editor);
    return () => vim.dispose();
  }, [editor, settings.vimMode]);
}
