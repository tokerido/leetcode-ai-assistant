import { useEffect, useState } from "react";
import type { Statistics as StatsType } from "../storage/statistics";
import type { MessageResponse } from "../llm/types";

export function Statistics({ refreshKey }: { refreshKey?: number }) {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  useEffect(() => {
    loadStats();

    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "local" && changes.statistics) {
        loadStats();
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [refreshKey]);

  async function loadStats() {
    const response = await chrome.runtime.sendMessage({ type: "GET_STATS" }) as MessageResponse;
    if (response.success) {
      setStats(response.data as StatsType);
    }
    setLoading(false);
  }

  async function handleImport() {
    setImporting(true);
    setImportResult(null);
    try {
      const response = await chrome.runtime.sendMessage({ type: "IMPORT_SOLVED" }) as MessageResponse;
      if (response.success) {
        setImportResult(`Imported ${(response.data as { imported: number }).imported} problems.`);
        await loadStats();
      } else {
        setImportResult(`Error: ${response.error}`);
      }
    } finally {
      setImporting(false);
    }
  }

  if (loading) return <div className="p-4 text-sm text-gray-500 animate-pulse">Loading stats...</div>;
  if (!stats) return <div className="p-4 text-sm text-red-500">Failed to load statistics</div>;

  const topPatterns = Object.entries(stats.byPattern)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Your Statistics</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalSolved}</p>
          <p className="text-xs text-gray-500">Total Solved</p>
        </div>
        <div className="grid grid-rows-3 gap-1">
          <div className="flex items-center justify-between px-2 py-1 bg-green-50 rounded text-xs">
            <span className="text-green-600 font-medium">Easy</span>
            <span className="font-bold">{stats.byDifficulty.Easy}</span>
          </div>
          <div className="flex items-center justify-between px-2 py-1 bg-yellow-50 rounded text-xs">
            <span className="text-yellow-600 font-medium">Medium</span>
            <span className="font-bold">{stats.byDifficulty.Medium}</span>
          </div>
          <div className="flex items-center justify-between px-2 py-1 bg-red-50 rounded text-xs">
            <span className="text-red-600 font-medium">Hard</span>
            <span className="font-bold">{stats.byDifficulty.Hard}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <button
          onClick={handleImport}
          disabled={importing}
          className="w-full py-2 px-4 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          {importing ? "Importing..." : "Import Solved from LeetCode"}
        </button>
        {importResult && <p className="text-xs text-center text-gray-500">{importResult}</p>}
      </div>

      {topPatterns.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Top Patterns</h3>
          <div className="space-y-1">
            {topPatterns.map(([pattern, count]) => (
              <div key={pattern} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-32 truncate">{pattern}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (count / stats.totalSolved) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalSolved === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No problems solved yet. Start solving to see your stats!
        </p>
      )}
    </div>
  );
}
