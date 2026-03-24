export interface LLMProvider {
  name: string;
  complete(prompt: string, systemPrompt: string, maxTokens?: number): Promise<string>;
  stream?(prompt: string, systemPrompt: string, maxTokens?: number): AsyncGenerator<string>;
}

export type LLMProviderName = "claude" | "openai" | "gemini";

export interface LLMSettings {
  activeProvider: LLMProviderName;
  claudeApiKey: string;
  openaiApiKey: string;
  geminiApiKey: string;
}

export interface MessageRequest {
  type: "LLM_COMPLETE" | "GET_SETTINGS" | "SAVE_SETTINGS" | "GET_STATS" | "SAVE_STATS" | "PROBLEM_SOLVED" | "PAGE_CONTEXT" | "GET_CONTEXT" | "IMPORT_SOLVED";
  payload?: unknown;
}

export interface LLMCompleteRequest {
  prompt: string;
  systemPrompt: string;
  provider?: LLMProviderName;
  maxTokens?: number;
}

export interface MessageResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}
