import { useEffect, useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { MessageResponse } from "../llm/types";
import { buildHintsPrompt, HINTS_SYSTEM } from "../prompts/hints";
import { getTabSlice, setTabSlice } from "../storage/tabCache";

interface HintsProps {
  slug: string;
  title: string;
  description: string;
}

export function Hints({ slug, title, description }: HintsProps) {
  const [hints, setHints] = useState<string[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setHints([]);
    setRevealedCount(0);
    setError("");
    getTabSlice(slug, "hints").then((cached) => {
      if (cached) {
        setHints(cached.hints);
        setRevealedCount(cached.revealedCount);
      }
    });
  }, [slug]);

  async function loadHints() {
    setLoading(true);
    setError("");
    try {
      const response = await chrome.runtime.sendMessage({
        type: "LLM_COMPLETE",
        payload: {
          prompt: buildHintsPrompt(title, description),
          systemPrompt: HINTS_SYSTEM,
          maxTokens: 2048,
        },
      }) as MessageResponse;

      if (!response.success) throw new Error(response.error || "Failed to load hints");

      const text = response.data as string;
      const parsed = text
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean);
      const newHints = parsed.length > 0 ? parsed : [text];
      setHints(newHints);
      setRevealedCount(1);
      await setTabSlice(slug, "hints", { hints: newHints, revealedCount: 1 });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function revealNext() {
    const next = revealedCount + 1;
    setRevealedCount(next);
    setTabSlice(slug, "hints", { hints, revealedCount: next });
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
          onClick={revealNext}
          className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm"
        >
          Next Hint ({revealedCount}/{hints.length})
        </button>
      )}
    </div>
  );
}
