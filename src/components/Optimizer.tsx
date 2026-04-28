import { useEffect, useState } from "react";
import type { MessageResponse } from "../llm/types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { buildOptimizePrompt, OPTIMIZE_SYSTEM } from "../prompts/optimize";
import { getTabSlice, setTabSlice } from "../storage/tabCache";

interface OptimizerProps {
  slug: string;
  code: string;
  language: string;
  title: string;
}

export function Optimizer({ slug, code, language, title }: OptimizerProps) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setResult("");
    setError("");
    getTabSlice(slug, "optimize").then((cached) => {
      if (cached) setResult(cached.result);
    });
  }, [slug]);

  async function optimize() {
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
          prompt: buildOptimizePrompt(code, title, language),
          systemPrompt: OPTIMIZE_SYSTEM,
          maxTokens: 8192,
        },
      }) as MessageResponse;

      if (!response.success) throw new Error(response.error || "Optimization failed");
      const text = response.data as string;
      setResult(text);
      await setTabSlice(slug, "optimize", { result: text });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">Optimize Solution</h2>
      <button
        onClick={optimize}
        disabled={loading}
        className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? "Optimizing..." : "Optimize My Solution"}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {result && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <MarkdownRenderer content={result} />
        </div>
      )}
    </div>
  );
}
