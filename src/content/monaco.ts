import type { LLMCompleteRequest, MessageResponse } from "../llm/types";
import { buildAutocompletePrompt, AUTOCOMPLETE_SYSTEM } from "../prompts/autocomplete";

interface MonacoGlobal {
  editor: {
    getModels(): Array<{
      getValue(): string;
      getLanguageId(): string;
    }>;
    onDidCreateEditor(callback: (editor: MonacoEditor) => void): void;
  };
  languages: {
    registerCompletionItemProvider(
      language: string | string[],
      provider: CompletionProvider
    ): void;
    CompletionItemKind: { Text: number };
  };
}

interface MonacoEditor {
  getPosition(): { lineNumber: number; column: number } | null;
  getModel(): { getValue(): string; getLanguageId(): string } | null;
}

interface CompletionProvider {
  provideCompletionItems(
    model: { getValue(): string; getLanguageId(): string },
    position: { lineNumber: number; column: number }
  ): Promise<{ suggestions: CompletionItem[] }>;
}

interface CompletionItem {
  label: string;
  kind: number;
  insertText: string;
  detail: string;
}

let completionDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export function hookMonacoAutocomplete(): void {
  const tryHook = () => {
    const monacoGlobal = (window as unknown as { monaco?: MonacoGlobal }).monaco;
    if (!monacoGlobal?.editor || !monacoGlobal?.languages) return;

    const supportedLanguages = ["python", "javascript", "typescript", "java", "cpp", "c"];

    for (const lang of supportedLanguages) {
      monacoGlobal.languages.registerCompletionItemProvider(lang, {
        async provideCompletionItems(model, position) {
          return new Promise((resolve) => {
            if (completionDebounceTimer) clearTimeout(completionDebounceTimer);
            completionDebounceTimer = setTimeout(async () => {
              try {
                const code = model.getValue();
                const language = model.getLanguageId();
                const prompt = buildAutocompletePrompt(
                  code,
                  position.lineNumber - 1,
                  position.column - 1,
                  language
                );

                const request: LLMCompleteRequest = {
                  prompt,
                  systemPrompt: AUTOCOMPLETE_SYSTEM,
                };

                const response = await chrome.runtime.sendMessage({
                  type: "LLM_COMPLETE",
                  payload: request,
                }) as MessageResponse;

                if (response.success && response.data) {
                  resolve({
                    suggestions: [
                      {
                        label: "AI Suggestion",
                        kind: monacoGlobal.languages.CompletionItemKind.Text,
                        insertText: response.data as string,
                        detail: "LeetCode AI Assistant",
                      },
                    ],
                  });
                } else {
                  resolve({ suggestions: [] });
                }
              } catch {
                resolve({ suggestions: [] });
              }
            }, 500);
          });
        },
      });
    }
  };

  // Poll for Monaco availability
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    tryHook();
    if ((window as unknown as { monaco?: MonacoGlobal }).monaco || attempts > 30) {
      clearInterval(interval);
    }
  }, 1000);
}
