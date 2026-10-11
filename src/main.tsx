import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/monaco/setup.ts";
import App from "./App.tsx";
import { EditorSettingsContextProvider } from "./context/EditorSettingsContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EditorSettingsContextProvider>
      <App />
    </EditorSettingsContextProvider>
  </StrictMode>,
);
