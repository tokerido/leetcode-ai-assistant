interface CompanyTagsProps {
  companies: string[];
}

export function CompanyTags({ companies }: CompanyTagsProps) {
  if (companies.length === 0) return null;

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Companies</h3>
      <div className="flex flex-wrap gap-1">
        {companies.map((company) => (
          <span
            key={company}
            className="px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-600 text-xs rounded-full"
          >
            {company}
          </span>
        ))}
      </div>
    </div>
  );
}
