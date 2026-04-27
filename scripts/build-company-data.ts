import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

const CACHE_DIR = path.join(process.cwd(), "scripts", ".cache", "topics");
const OUT_FILE = path.join(process.cwd(), "src", "data", "company-tags.generated.ts");
const GITHUB_API = "https://api.github.com/repos/ayush-that/codejeet/contents/data/companies";
const RAW_BASE = "https://raw.githubusercontent.com/ayush-that/codejeet/main/data/companies";
const LEETCODE_GRAPHQL = "https://leetcode.com/graphql/";
const CONCURRENCY = 15;
const TOPIC_BATCH_DELAY_MS = 200; // ~5 req/sec

interface CsvRow {
  ID: string;
  URL: string;
  Title: string;
  Difficulty: string;
  "Acceptance %": string;
  "Frequency %": string;
}

interface ProblemEntry {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  companies: string[];
  patterns: string[];
}

function toDisplayName(filename: string): string {
  return filename
    .replace(/\.csv$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function slugFromUrl(url: string): string | null {
  const m = url.match(/\/problems\/([^/]+)/);
  return m ? m[1] : null;
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
        continue;
      }
      throw new Error(`HTTP ${res.status} for ${url}`);
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error(`All retries failed for ${url}`);
}

async function runConcurrent<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

async function listCompanyFiles(): Promise<string[]> {
  console.log("Fetching company file list from GitHub...");
  const res = await fetchWithRetry(GITHUB_API);
  const data = await res.json() as { name: string; type: string }[];
  return data.filter((f) => f.type === "file" && f.name.endsWith(".csv")).map((f) => f.name);
}

async function fetchCsv(filename: string): Promise<{ company: string; rows: CsvRow[] }> {
  const company = toDisplayName(filename);
  const url = `${RAW_BASE}/${filename}`;
  const res = await fetchWithRetry(url);
  const text = await res.text();
  const { data } = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true });
  return { company, rows: data };
}

async function fetchTopics(slug: string): Promise<string[]> {
  const cacheFile = path.join(CACHE_DIR, `${slug}.json`);
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, "utf-8")) as string[];
  }

  await new Promise((r) => setTimeout(r, TOPIC_BATCH_DELAY_MS));

  try {
    const res = await fetch(LEETCODE_GRAPHQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query questionTopicTags($titleSlug: String!) {
          question(titleSlug: $titleSlug) { topicTags { name } }
        }`,
        variables: { titleSlug: slug },
      }),
    });
    const json = await res.json() as { data?: { question?: { topicTags?: { name: string }[] } } };
    const tags = json.data?.question?.topicTags?.map((t) => t.name) ?? [];
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify(tags));
    return tags;
  } catch {
    return [];
  }
}

async function main() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const files = await listCompanyFiles();
  console.log(`Found ${files.length} company CSV files.`);

  // Download all CSVs concurrently
  const tasks = files.map((f) => () => fetchCsv(f));
  console.log(`Downloading ${files.length} CSVs (concurrency ${CONCURRENCY})...`);
  const results = await runConcurrent(tasks, CONCURRENCY);

  // Build deduped problem map: slug → ProblemEntry
  const problemMap = new Map<string, ProblemEntry>();

  for (const { company, rows } of results) {
    for (const row of rows) {
      if (!row.URL) continue;
      const slug = slugFromUrl(row.URL);
      if (!slug) continue;
      const difficulty = (row.Difficulty || "").trim() as "Easy" | "Medium" | "Hard";
      if (!["Easy", "Medium", "Hard"].includes(difficulty)) continue;

      if (!problemMap.has(slug)) {
        problemMap.set(slug, {
          slug,
          title: (row.Title || "").trim(),
          difficulty,
          companies: [],
          patterns: [],
        });
      }
      const entry = problemMap.get(slug)!;
      if (!entry.companies.includes(company)) {
        entry.companies.push(company);
      }
    }
  }

  const slugs = Array.from(problemMap.keys());
  console.log(`Deduped to ${slugs.length} unique problems. Fetching LeetCode topic tags...`);

  // Enrich with topics in serial batches (respect rate limit)
  let done = 0;
  for (const slug of slugs) {
    const tags = await fetchTopics(slug);
    problemMap.get(slug)!.patterns = tags;
    done++;
    if (done % 100 === 0) {
      console.log(`  Topics: ${done}/${slugs.length}`);
    }
  }

  const problems = Array.from(problemMap.values());
  console.log(`Writing ${problems.length} entries to company-tags.generated.ts...`);

  const lines: string[] = [
    `// Generated by scripts/build-company-data.ts — do not edit manually.`,
    `// Source: https://github.com/ayush-that/codejeet`,
    ``,
    `export interface ProblemEntry {`,
    `  slug: string;`,
    `  title: string;`,
    `  difficulty: "Easy" | "Medium" | "Hard";`,
    `  companies: string[];`,
    `  patterns: string[];`,
    `}`,
    ``,
    `export const COMPANY_PROBLEMS: ProblemEntry[] = ${JSON.stringify(problems, null, 2)};`,
  ];

  fs.writeFileSync(OUT_FILE, lines.join("\n") + "\n");
  console.log(`Done. Output: ${OUT_FILE}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
