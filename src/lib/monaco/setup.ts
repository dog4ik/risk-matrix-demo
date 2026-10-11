// Bundle Monaco locally instead of loading it from a CDN

import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/language/json/json.worker?worker";
import { registerCompletion } from "./completion";
import { registerMahoraga } from "./language";

self.MonacoEnvironment = {
  getWorker: (_id, label) =>
    label === "json" ? new JsonWorker() : new EditorWorker(),
};

loader.config({ monaco });
registerMahoraga(monaco);
registerCompletion(monaco);
