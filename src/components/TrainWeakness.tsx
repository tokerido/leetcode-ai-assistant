import { useEffect, useState } from "react";
import { COMPANY_PROBLEMS } from "../data/company-tags";
import type { ProblemEntry } from "../data/company-tags";
import type { Statistics } from "../storage/statistics";
import type { MessageResponse } from "../llm/types";

export function TrainWeakness() {
  const [suggestions, setSuggestions] = useState<ProblemEntry[]>([]);
  const [weakPatterns, setWeakPatterns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    const response = await chrome.runtime.sendMessage({ type: "GET_STATS" }) as MessageResponse;
    if (!response.success) { setLoading(false); return; }

    const stats = response.data as Statistics;
    const solvedSlugs = new Set(stats.solved.map((p) => p.slug));

    // Find weak patterns (practiced least relative to total)
    const allPatterns = [...new Set(COMPANY_PROBLEMS.flatMap((p) => p.patterns))];
    const patternCounts = stats.byPattern;
    const sorted = allPatterns
      .filter((p) => !patternCounts[p] || patternCounts[p] < 3)
      .sort((a, b) => (patternCounts[a] || 0) - (patternCounts[b] || 0));

    setWeakPatterns(sorted.slice(0, 3));

    // Find unsolved problems matching weak patterns
    const suggested = COMPANY_PROBLEMS
      .filter((p) => !solvedSlugs.has(p.slug))
      .filter((p) => p.patterns.some((pat) => sorted.slice(0, 5).includes(pat)))
      .slice(0, 10);

    setSuggestions(suggested);
    setLoading(false);
  }

  const difficultyColor = {
    Easy: "text-green-600",
    Medium: "text-yellow-600",
    Hard: "text-red-600",
  };

  if (loading) return <div className="p-4 text-sm text-gray-500 animate-pulse">Analyzing weaknesses...</div>;

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">Train Weaknesses</h2>
      {weakPatterns.length > 0 && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs font-medium text-orange-700 mb-1">Areas to improve:</p>
          <div className="flex flex-wrap gap-1">
            {weakPatterns.map((p) => (
              <span key={p} className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">{p}</span>
            ))}
          </div>
        </div>
      )}
      {suggestions.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          {weakPatterns.length === 0
            ? "Keep solving to identify weak areas!"
            : "Great job! No specific weaknesses detected."}
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {suggestions.map((problem) => (
            <a
              key={problem.slug}
              href={`https://leetcode.com/problems/${problem.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-sm transition"
            >
              <div>
                <span className="text-gray-700">{problem.title}</span>
                <div className="flex gap-1 mt-0.5">
                  {problem.patterns.slice(0, 2).map((pat) => (
                    <span key={pat} className="text-xs text-gray-400">{pat}</span>
                  ))}
                </div>
              </div>
              <span className={`text-xs font-medium ${difficultyColor[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
