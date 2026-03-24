import { useState } from "react";
import type { MessageResponse } from "../llm/types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { buildComplexityPrompt, COMPLEXITY_SYSTEM } from "../prompts/complexity";

interface ComplexityAnalyzerProps {
  code: string;
  language: string;
}

export function ComplexityAnalyzer({ code, language }: ComplexityAnalyzerProps) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!code.trim()) {
      setError("No code found in editor");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    try {
      const response = await chrome.runtime.sendMessage({
        type: "LLM_COMPLETE",
        payload: {
          prompt: buildComplexityPrompt(code, language),
          systemPrompt: COMPLEXITY_SYSTEM,
          maxTokens: 2048,
        },
      }) as MessageResponse;

      if (!response.success) throw new Error(response.error || "Analysis failed");
      setResult(response.data as string);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">Complexity Analysis</h2>
      <button
        onClick={analyze}
        disabled={loading}
        className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Complexity"}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {result && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <MarkdownRenderer content={result} />
        </div>
      )}
    </div>
  );
}
