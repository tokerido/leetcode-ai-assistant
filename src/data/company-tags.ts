import { COMPANY_PROBLEMS, type ProblemEntry } from "./company-tags.generated";

export { COMPANY_PROBLEMS };
export type { ProblemEntry };

export function getCompanies(): string[] {
  const companies = new Set<string>();
  for (const problem of COMPANY_PROBLEMS) {
    for (const company of problem.companies) {
      companies.add(company);
    }
  }
  return Array.from(companies).sort();
}

export function getProblemsByCompany(company: string): ProblemEntry[] {
  return COMPANY_PROBLEMS.filter((p) => p.companies.includes(company));
}

export function getCompaniesForSlug(slug: string): string[] {
  const problem = COMPANY_PROBLEMS.find((p) => p.slug === slug);
  return problem?.companies || [];
}

export function getPatternsForSlug(slug: string): string[] {
  const problem = COMPANY_PROBLEMS.find((p) => p.slug === slug);
  return problem?.patterns || [];
}
