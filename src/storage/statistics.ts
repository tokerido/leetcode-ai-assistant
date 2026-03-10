export interface SolvedProblem {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  patterns: string[];
  solvedAt: number;
  companies: string[];
}

export interface Statistics {
  solved: SolvedProblem[];
  totalSolved: number;
  byDifficulty: { Easy: number; Medium: number; Hard: number };
  byPattern: Record<string, number>;
}

const DEFAULT_STATS: Statistics = {
  solved: [],
  totalSolved: 0,
  byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
  byPattern: {},
};

export async function getStatistics(): Promise<Statistics> {
  return new Promise((resolve) => {
    chrome.storage.local.get("statistics", (result) => {
      resolve(result.statistics || DEFAULT_STATS);
    });
  });
}

export async function saveStatistics(stats: Statistics): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ statistics: stats }, resolve);
  });
}

export async function recordSolvedProblem(problem: SolvedProblem): Promise<void> {
  const stats = await getStatistics();
  const alreadySolved = stats.solved.find((p) => p.slug === problem.slug);
  if (alreadySolved) return;

  stats.solved.push(problem);
  stats.totalSolved++;
  stats.byDifficulty[problem.difficulty]++;
  for (const pattern of problem.patterns) {
    stats.byPattern[pattern] = (stats.byPattern[pattern] || 0) + 1;
  }

  await saveStatistics(stats);
}
