export interface LLMProvider {
  name: string;
  complete(prompt: string, systemPrompt: string): Promise<string>;
  stream?(prompt: string, systemPrompt: string): AsyncGenerator<string>;
}

export type LLMProviderName = "claude" | "openai" | "gemini";

export interface LLMSettings {
  activeProvider: LLMProviderName;
  claudeApiKey: string;
  openaiApiKey: string;
  geminiApiKey: string;
}

export interface MessageRequest {
  type: "LLM_COMPLETE" | "GET_SETTINGS" | "SAVE_SETTINGS" | "GET_STATS" | "SAVE_STATS";
  payload?: unknown;
}

export interface LLMCompleteRequest {
  prompt: string;
  systemPrompt: string;
  provider?: LLMProviderName;
}

export interface MessageResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}
