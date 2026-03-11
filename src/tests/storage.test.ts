import { describe, it, expect } from "vitest";
import { getSettings, saveSettings } from "../storage/settings";
import { getStatistics, saveStatistics, recordSolvedProblem } from "../storage/statistics";
import type { SolvedProblem } from "../storage/statistics";

// ── Settings ─────────────────────────────────────────────────────────────────

describe("settings storage", () => {
  it("returns defaults when nothing is saved", async () => {
    const settings = await getSettings();
    expect(settings.activeProvider).toBe("claude");
    expect(settings.claudeApiKey).toBe("");
    expect(settings.openaiApiKey).toBe("");
    expect(settings.geminiApiKey).toBe("");
  });

  it("round-trips saved settings", async () => {
    await saveSettings({ activeProvider: "gemini", geminiApiKey: "AIza-test" });
    const settings = await getSettings();
    expect(settings.activeProvider).toBe("gemini");
    expect(settings.geminiApiKey).toBe("AIza-test");
  });

  it("partial save does not overwrite unrelated keys", async () => {
    await saveSettings({ claudeApiKey: "sk-ant-abc" });
    await saveSettings({ openaiApiKey: "sk-oai-xyz" });
    const settings = await getSettings();
    expect(settings.claudeApiKey).toBe("sk-ant-abc");
    expect(settings.openaiApiKey).toBe("sk-oai-xyz");
  });
});

// ── Statistics ────────────────────────────────────────────────────────────────

const makeProblem = (slug: string, difficulty: "Easy" | "Medium" | "Hard" = "Medium"): SolvedProblem => ({
  slug,
  title: slug,
  difficulty,
  patterns: ["hash-map"],
  solvedAt: Date.now(),
  companies: ["Google"],
});

describe("statistics storage", () => {
  it("returns empty defaults when nothing is saved", async () => {
    const stats = await getStatistics();
    expect(stats.totalSolved).toBe(0);
    expect(stats.solved).toHaveLength(0);
    expect(stats.byDifficulty).toEqual({ Easy: 0, Medium: 0, Hard: 0 });
  });

  it("round-trips saved statistics", async () => {
    const problem = makeProblem("two-sum", "Easy");
    await saveStatistics({
      solved: [problem],
      totalSolved: 1,
      byDifficulty: { Easy: 1, Medium: 0, Hard: 0 },
      byPattern: { "hash-map": 1 },
    });
    const stats = await getStatistics();
    expect(stats.totalSolved).toBe(1);
    expect(stats.solved[0].slug).toBe("two-sum");
  });
});

describe("recordSolvedProblem", () => {
  it("increments totalSolved and byDifficulty", async () => {
    await recordSolvedProblem(makeProblem("two-sum", "Easy"));
    const stats = await getStatistics();
    expect(stats.totalSolved).toBe(1);
    expect(stats.byDifficulty.Easy).toBe(1);
    expect(stats.byDifficulty.Medium).toBe(0);
  });

  it("tracks patterns", async () => {
    await recordSolvedProblem(makeProblem("two-sum", "Easy"));
    const stats = await getStatistics();
    expect(stats.byPattern["hash-map"]).toBe(1);
  });

  it("does not double-count the same problem", async () => {
    await recordSolvedProblem(makeProblem("two-sum"));
    await recordSolvedProblem(makeProblem("two-sum"));
    const stats = await getStatistics();
    expect(stats.totalSolved).toBe(1);
    expect(stats.solved).toHaveLength(1);
  });

  it("accumulates multiple different problems", async () => {
    await recordSolvedProblem(makeProblem("two-sum", "Easy"));
    await recordSolvedProblem(makeProblem("best-time-to-buy", "Medium"));
    await recordSolvedProblem(makeProblem("trapping-rain-water", "Hard"));
    const stats = await getStatistics();
    expect(stats.totalSolved).toBe(3);
    expect(stats.byDifficulty).toEqual({ Easy: 1, Medium: 1, Hard: 1 });
  });
});
