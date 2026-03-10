import { useEffect, useState } from "react";
import { Hints } from "../components/Hints";
import { ComplexityAnalyzer } from "../components/ComplexityAnalyzer";
import { ErrorExplainer } from "../components/ErrorExplainer";
import { Optimizer } from "../components/Optimizer";
import { Statistics } from "../components/Statistics";
import { TrainByCompany } from "../components/TrainByCompany";
import { TrainWeakness } from "../components/TrainWeakness";
import { CompanyTags } from "../components/CompanyTags";
import { getCompaniesForSlug } from "../data/company-tags";
import { getSettings, saveSettings } from "../storage/settings";
import type { ProblemContext } from "../content/leetcode";
import type { LLMSettings, LLMProviderName, MessageResponse } from "../llm/types";

type Tab = "hints" | "complexity" | "errors" | "optimize" | "stats" | "company" | "weakness" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "hints", label: "Hints" },
  { id: "complexity", label: "Complexity" },
  { id: "errors", label: "Errors" },
  { id: "optimize", label: "Optimize" },
  { id: "stats", label: "Stats" },
  { id: "company", label: "Company" },
  { id: "weakness", label: "Weakness" },
  { id: "settings", label: "⚙" },
];

function SettingsPanel() {
  const [settings, setSettings] = useState<LLMSettings>({
    activeProvider: "claude",
    claudeApiKey: "",
    openaiApiKey: "",
    geminiApiKey: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => { getSettings().then(setSettings); }, []);

  async function handleSave() {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">AI Provider</label>
        <select
          value={settings.activeProvider}
          onChange={(e) => setSettings((s) => ({ ...s, activeProvider: e.target.value as LLMProviderName }))}
          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="claude">Claude (Anthropic)</option>
          <option value="openai">ChatGPT (OpenAI)</option>
          <option value="gemini">Gemini (Google)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Anthropic API Key</label>
        <input type="password" value={settings.claudeApiKey}
          onChange={(e) => setSettings((s) => ({ ...s, claudeApiKey: e.target.value }))}
          placeholder="sk-ant-..."
          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">OpenAI API Key</label>
        <input type="password" value={settings.openaiApiKey}
          onChange={(e) => setSettings((s) => ({ ...s, openaiApiKey: e.target.value }))}
          placeholder="sk-..."
          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Google API Key</label>
        <input type="password" value={settings.geminiApiKey}
          onChange={(e) => setSettings((s) => ({ ...s, geminiApiKey: e.target.value }))}
          placeholder="AIza..."
          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <button onClick={handleSave}
        className="w-full py-2 px-4 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
      >
        {saved ? "Saved!" : "Save Settings"}
      </button>
      <p className="text-xs text-gray-400 text-center">Keys stored locally in your browser</p>
    </div>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("hints");
  const [context, setContext] = useState<ProblemContext | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    // Listen for context updates from content script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "PAGE_CONTEXT") {
        const ctx = message.payload as ProblemContext;
        setContext(ctx);
        setCompanies(getCompaniesForSlug(ctx.slug));
      }
      if (message.type === "PROBLEM_SOLVED") {
        // Could refresh stats here
      }
    });

    // Try to get context from active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "GET_CONTEXT" }, (response: MessageResponse) => {
          if (response?.success && response.data) {
            const ctx = response.data as ProblemContext;
            setContext(ctx);
            setCompanies(getCompaniesForSlug(ctx.slug));
          }
        });
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-base font-bold text-gray-900">LeetCode AI Assistant</h1>
        {context ? (
          <p className="text-xs text-gray-500 truncate">{context.title}</p>
        ) : (
          <p className="text-xs text-gray-400">Open a LeetCode problem to get started</p>
        )}
      </div>

      {/* Company tags */}
      {companies.length > 0 && <CompanyTags companies={companies} />}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {!context && activeTab !== "stats" && activeTab !== "company" && activeTab !== "weakness" && activeTab !== "settings" ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm">Navigate to a LeetCode problem to use this feature</p>
          </div>
        ) : (
          <>
            {activeTab === "hints" && context && (
              <Hints title={context.title} description={context.description} />
            )}
            {activeTab === "complexity" && context && (
              <ComplexityAnalyzer code={context.code} language={context.language} />
            )}
            {activeTab === "errors" && context && (
              <ErrorExplainer code={context.code} language={context.language} />
            )}
            {activeTab === "optimize" && context && (
              <Optimizer code={context.code} language={context.language} title={context.title} />
            )}
            {activeTab === "stats" && <Statistics />}
            {activeTab === "company" && <TrainByCompany />}
            {activeTab === "weakness" && <TrainWeakness />}
            {activeTab === "settings" && <SettingsPanel />}
          </>
        )}
      </div>
    </div>
  );
}
