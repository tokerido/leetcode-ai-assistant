import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../storage/settings";
import type { LLMSettings, LLMProviderName } from "../llm/types";

export function App() {
  const [settings, setSettings] = useState<LLMSettings>({
    activeProvider: "claude",
    claudeApiKey: "",
    openaiApiKey: "",
    geminiApiKey: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  async function handleSave() {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="w-80 p-4 bg-white">
      <h1 className="text-base font-bold text-gray-900 mb-4">LeetCode AI Assistant</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">AI Provider</label>
          <select
            value={settings.activeProvider}
            onChange={(e) =>
              setSettings((s) => ({ ...s, activeProvider: e.target.value as LLMProviderName }))
            }
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="claude">Claude (Anthropic)</option>
            <option value="openai">ChatGPT (OpenAI)</option>
            <option value="gemini">Gemini (Google)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Anthropic API Key
          </label>
          <input
            type="password"
            value={settings.claudeApiKey}
            onChange={(e) => setSettings((s) => ({ ...s, claudeApiKey: e.target.value }))}
            placeholder="sk-ant-..."
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">OpenAI API Key</label>
          <input
            type="password"
            value={settings.openaiApiKey}
            onChange={(e) => setSettings((s) => ({ ...s, openaiApiKey: e.target.value }))}
            placeholder="sk-..."
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Google API Key</label>
          <input
            type="password"
            value={settings.geminiApiKey}
            onChange={(e) => setSettings((s) => ({ ...s, geminiApiKey: e.target.value }))}
            placeholder="AIza..."
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
        >
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        API keys are stored locally in your browser
      </p>
    </div>
  );
}
