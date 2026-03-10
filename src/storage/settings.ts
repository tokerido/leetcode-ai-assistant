import type { LLMSettings, LLMProviderName } from "../llm/types";

export const DEFAULT_SETTINGS: LLMSettings = {
  activeProvider: "claude",
  claudeApiKey: "",
  openaiApiKey: "",
  geminiApiKey: "",
};

export async function getSettings(): Promise<LLMSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ["activeProvider", "claudeApiKey", "openaiApiKey", "geminiApiKey"],
      (result) => {
        resolve({
          activeProvider: (result.activeProvider as LLMProviderName) || "claude",
          claudeApiKey: result.claudeApiKey || "",
          openaiApiKey: result.openaiApiKey || "",
          geminiApiKey: result.geminiApiKey || "",
        });
      }
    );
  });
}

export async function saveSettings(settings: Partial<LLMSettings>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, resolve);
  });
}
