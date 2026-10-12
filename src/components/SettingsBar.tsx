import { useId } from "react";
import { useEditorSettingsContext } from "../context/EditorSettingsContext";

export function SettingsBar() {
  let { settings, setSettings } = useEditorSettingsContext();
  let inputId = useId();

  return (
    <div className="flex items-center gap-2">
      <div>
        <input
          type="checkbox"
          id={inputId}
          checked={settings.vimMode}
          onChange={(e) =>
            setSettings({ ...settings, vimMode: e.currentTarget.checked })
          }
        />{" "}
        <label htmlFor={inputId}>Vim Mode</label>
      </div>
    </div>
  );
}
