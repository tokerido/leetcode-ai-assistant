import { useState } from "react";

interface CompanyTagsProps {
  companies: string[];
}

const VISIBLE_LIMIT = 5;

export function CompanyTags({ companies }: CompanyTagsProps) {
  const [expanded, setExpanded] = useState(false);

  if (companies.length === 0) return null;

  const visible = expanded ? companies : companies.slice(0, VISIBLE_LIMIT);
  const overflow = companies.length - VISIBLE_LIMIT;

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Companies</h3>
      <div className="flex flex-wrap gap-1">
        {visible.map((company) => (
          <span
            key={company}
            className="px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-600 text-xs rounded-full"
          >
            {company}
          </span>
        ))}
        {!expanded && overflow > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 text-xs rounded-full hover:bg-blue-100 transition"
          >
            +{overflow} more
          </button>
        )}
        {expanded && overflow > 0 && (
          <button
            onClick={() => setExpanded(false)}
            className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-500 text-xs rounded-full hover:bg-gray-100 transition"
          >
            show less
          </button>
        )}
      </div>
    </div>
  );
}
