import { useEditorSettingsContext } from "../context/EditorSettingsContext";

export function SettingsBar() {
  let { settings, setSettings } = useEditorSettingsContext();

  return (
    <div className="flex items-center gap-2">
      <div>
        <input
          type="checkbox"
          checked={settings.vimMode}
          onChange={(e) =>
            setSettings({ ...settings, vimMode: e.currentTarget.checked })
          }
        />{" "}
        <span>Vim Mode</span>
      </div>
    </div>
  );
}
