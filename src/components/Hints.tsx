import { useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { MessageResponse } from "../llm/types";
import { buildHintsPrompt, HINTS_SYSTEM } from "../prompts/hints";

interface HintsProps {
  title: string;
  description: string;
}

export function Hints({ title, description }: HintsProps) {
  const [hints, setHints] = useState<string[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadHints() {
    setLoading(true);
    setError("");
    try {
      const response = await chrome.runtime.sendMessage({
        type: "LLM_COMPLETE",
        payload: {
          prompt: buildHintsPrompt(title, description),
          systemPrompt: HINTS_SYSTEM,
          maxTokens: 1024,
        },
      }) as MessageResponse;

      if (!response.success) throw new Error(response.error || "Failed to load hints");

      const text = response.data as string;
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]) as string[];
        setHints(parsed);
        setRevealedCount(1);
      } else {
        setHints([text]);
        setRevealedCount(1);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">Hints</h2>
      {hints.length === 0 && !loading && (
        <button
          onClick={loadHints}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Get Hints
        </button>
      )}
      {loading && <p className="text-sm text-gray-500 animate-pulse">Loading hints...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {hints.slice(0, revealedCount).map((hint, i) => (
        <div key={i} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-700">Hint {i + 1}</p>
          <div className="mt-1"><MarkdownRenderer content={hint} /></div>
        </div>
      ))}
      {hints.length > 0 && revealedCount < hints.length && (
        <button
          onClick={() => setRevealedCount((c) => c + 1)}
          className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm"
        >
          Next Hint ({revealedCount}/{hints.length})
        </button>
      )}
    </div>
  );
}
