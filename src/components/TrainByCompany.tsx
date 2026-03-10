import { useState } from "react";
import { getCompanies, getProblemsByCompany } from "../data/company-tags";
import type { ProblemEntry } from "../data/company-tags";
import type { Statistics } from "../storage/statistics";
import type { MessageResponse } from "../llm/types";

export function TrainByCompany() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [problems, setProblems] = useState<ProblemEntry[]>([]);
  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());

  const companies = getCompanies();

  async function handleCompanySelect(company: string) {
    setSelectedCompany(company);
    const probs = getProblemsByCompany(company);
    setProblems(probs);

    const response = await chrome.runtime.sendMessage({ type: "GET_STATS" }) as MessageResponse;
    if (response.success) {
      const stats = response.data as Statistics;
      setSolvedSlugs(new Set(stats.solved.map((p) => p.slug)));
    }
  }

  const difficultyColor = {
    Easy: "text-green-600",
    Medium: "text-yellow-600",
    Hard: "text-red-600",
  };

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">Train by Company</h2>
      <select
        value={selectedCompany}
        onChange={(e) => handleCompanySelect(e.target.value)}
        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">Select a company...</option>
        {companies.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {problems.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <p className="text-xs text-gray-500">
            {problems.filter((p) => solvedSlugs.has(p.slug)).length}/{problems.length} solved
          </p>
          {problems.map((problem) => (
            <a
              key={problem.slug}
              href={`https://leetcode.com/problems/${problem.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-2 rounded-lg border text-sm transition ${
                solvedSlugs.has(problem.slug)
                  ? "bg-green-50 border-green-200 opacity-60"
                  : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <span className="flex items-center gap-2">
                {solvedSlugs.has(problem.slug) && <span className="text-green-500">✓</span>}
                <span className="text-gray-700">{problem.title}</span>
              </span>
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
