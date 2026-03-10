import type { LLMProvider, LLMProviderName } from "./types";
import { ClaudeProvider } from "./claude";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";

export async function getActiveProvider(): Promise<LLMProvider> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(
      ["activeProvider", "claudeApiKey", "openaiApiKey", "geminiApiKey"],
      (result) => {
        const provider: LLMProviderName = result.activeProvider || "claude";
        switch (provider) {
          case "claude":
            if (!result.claudeApiKey) reject(new Error("Claude API key not set"));
            else resolve(new ClaudeProvider(result.claudeApiKey));
            break;
          case "openai":
            if (!result.openaiApiKey) reject(new Error("OpenAI API key not set"));
            else resolve(new OpenAIProvider(result.openaiApiKey));
            break;
          case "gemini":
            if (!result.geminiApiKey) reject(new Error("Gemini API key not set"));
            else resolve(new GeminiProvider(result.geminiApiKey));
            break;
          default:
            reject(new Error(`Unknown provider: ${provider}`));
        }
      }
    );
  });
}
