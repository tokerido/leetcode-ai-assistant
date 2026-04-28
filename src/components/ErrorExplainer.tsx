import { useEffect, useState } from "react";
import type { MessageResponse } from "../llm/types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { buildErrorPrompt, ERRORS_SYSTEM } from "../prompts/errors";
import { getTabSlice, setTabSlice } from "../storage/tabCache";

interface ErrorExplainerProps {
  slug: string;
  code: string;
  language: string;
}

export function ErrorExplainer({ slug, code, language }: ErrorExplainerProps) {
  const [errorText, setErrorText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setErrorText("");
    setResult("");
    setError("");
    getTabSlice(slug, "errors").then((cached) => {
      if (cached) {
        setErrorText(cached.errorText);
        setResult(cached.result);
      }
    });
  }, [slug]);

  function handleErrorTextChange(text: string) {
    setErrorText(text);
    setTabSlice(slug, "errors", { errorText: text, result });
  }

  async function explain() {
    if (!errorText.trim()) {
      setError("Please enter the error message");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    try {
      const response = await chrome.runtime.sendMessage({
        type: "LLM_COMPLETE",
        payload: {
          prompt: buildErrorPrompt(code, errorText, language),
          systemPrompt: ERRORS_SYSTEM,
          maxTokens: 2048,
        },
      }) as MessageResponse;

      if (!response.success) throw new Error(response.error || "Failed to explain error");
      const text = response.data as string;
      setResult(text);
      await setTabSlice(slug, "errors", { errorText, result: text });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">Explain Error</h2>
      <textarea
        value={errorText}
        onChange={(e) => handleErrorTextChange(e.target.value)}
        placeholder="Paste your error message here..."
        className="w-full h-24 p-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
      />
      <button
        onClick={explain}
        disabled={loading}
        className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
      >
        {loading ? "Explaining..." : "Explain Error"}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {result && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <MarkdownRenderer content={result} />
        </div>
      )}
    </div>
  );
}
