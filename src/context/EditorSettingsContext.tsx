import { createContext, type ReactNode, useContext, useState } from "react";

type EditorSettings = {
  vimMode: boolean;
};

type EditorSettingsContext = {
  settings: EditorSettings;
  setSettings: (settings: EditorSettings) => void;
};

const context = createContext<EditorSettingsContext | undefined>(undefined);

export const useEditorSettingsContext = () => useContext(context)!;

export function EditorSettingsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  let [value, setValue] = useState<EditorSettings>({ vimMode: true });
  return (
    <context.Provider value={{ settings: value, setSettings: setValue }}>
      {children}
    </context.Provider>
  );
}
