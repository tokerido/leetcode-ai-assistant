import { useState, useRef, useEffect } from "react";
import { getCompanies, getProblemsByCompany } from "../data/company-tags";
import type { ProblemEntry } from "../data/company-tags";
import type { Statistics } from "../storage/statistics";
import type { MessageResponse } from "../llm/types";

export function TrainByCompany() {
  const [query, setQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [problems, setProblems] = useState<ProblemEntry[]>([]);
  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allCompanies = getCompanies();
  const filtered = query.trim()
    ? allCompanies.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : allCompanies;

  async function handleCompanySelect(company: string) {
    setSelectedCompany(company);
    setQuery(company);
    setIsOpen(false);
    const probs = getProblemsByCompany(company);
    setProblems(probs);

    const response = await chrome.runtime.sendMessage({ type: "GET_STATS" }) as MessageResponse;
    if (response.success) {
      const stats = response.data as Statistics;
      setSolvedSlugs(new Set(stats.solved.map((p) => p.slug)));
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setIsOpen(true);
    if (e.target.value !== selectedCompany) {
      setSelectedCompany("");
      setProblems([]);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const difficultyColor = {
    Easy: "text-green-600",
    Medium: "text-yellow-600",
    Hard: "text-red-600",
  };

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">Train by Company</h2>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search company..."
          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {isOpen && filtered.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            {filtered.slice(0, 100).map((company) => (
              <button
                key={company}
                onMouseDown={(e) => { e.preventDefault(); handleCompanySelect(company); }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 transition ${
                  company === selectedCompany ? "bg-blue-100 font-medium" : "text-gray-700"
                }`}
              >
                {company}
              </button>
            ))}
            {filtered.length > 100 && (
              <p className="px-3 py-1.5 text-xs text-gray-400">
                {filtered.length - 100} more — type to narrow
              </p>
            )}
          </div>
        )}
      </div>

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
