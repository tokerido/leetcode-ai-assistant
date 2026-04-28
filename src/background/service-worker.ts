import { getActiveProvider } from "../llm/router";
import type { LLMCompleteRequest, MessageResponse } from "../llm/types";
import { getSettings, saveSettings } from "../storage/settings";
import { getStatistics, saveStatistics, recordSolvedProblem } from "../storage/statistics";
import type { Statistics, SolvedProblem } from "../storage/statistics";
import { COMPANY_PROBLEMS } from "../data/company-tags";
import type { ProblemContext } from "../content/leetcode";

const DEBUG = false;

// Per-tab context cache. Backed by chrome.storage.session so it survives
// service-worker spin-downs (MV3 SWs idle out after ~30s).
const TAB_CACHE_PREFIX = "tabCtx_";
const cacheKey = (tabId: number) => `${TAB_CACHE_PREFIX}${tabId}`;

async function setTabContext(tabId: number, ctx: ProblemContext | null) {
  await chrome.storage.session.set({ [cacheKey(tabId)]: ctx });
}
async function getTabContext(tabId: number): Promise<ProblemContext | null> {
  const r = await chrome.storage.session.get(cacheKey(tabId));
  return (r[cacheKey(tabId)] as ProblemContext | null) ?? null;
}
async function deleteTabContext(tabId: number) {
  await chrome.storage.session.remove(cacheKey(tabId));
}

chrome.tabs.onRemoved.addListener((tabId) => { deleteTabContext(tabId); });
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // Evict on full navigation so stale context isn't served. SPA URL changes
  // don't fire status="loading", so they keep their cache (the content
  // script will overwrite it via PAGE_CONTEXT anyway).
  if (changeInfo.status === "loading") deleteTabContext(tabId);
});

const CONTENT_SCRIPT_FILE = "src/content/index.js";

async function injectIntoOpenLeetCodeTabs() {
  // Chrome does NOT auto-inject content scripts into pre-existing tabs after
  // an extension install/reload. Catch them up so the panel can talk to them.
  const tabs = await chrome.tabs.query({ url: "https://leetcode.com/problems/*" });
  for (const tab of tabs) {
    if (tab.id === undefined) continue;
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: [CONTENT_SCRIPT_FILE] });
      if (DEBUG) console.log(`[SW] Injected content script into tab ${tab.id}`);
    } catch (err) {
      // Ignore "Cannot access" / already-injected errors silently
      if (DEBUG) console.warn(`[SW] Inject failed for tab ${tab.id}:`, err);
    }
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  injectIntoOpenLeetCodeTabs();
});

chrome.runtime.onStartup.addListener(() => {
  injectIntoOpenLeetCodeTabs();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const req = message as { type: string; payload?: unknown };

  switch (req.type) {
    case "PAGE_CONTEXT": {
      const tabId = _sender.tab?.id;
      if (tabId !== undefined) {
        setTabContext(tabId, req.payload as ProblemContext | null)
          .then(() => sendResponse({ success: true } as MessageResponse))
          .catch((err) => sendResponse({ success: false, error: (err as Error).message } as MessageResponse));
        return true;
      }
      sendResponse({ success: false, error: "No tab id" } as MessageResponse);
      return false;
    }

    case "GET_LATEST_CONTEXT": {
      const { tabId } = req.payload as { tabId: number };
      getTabContext(tabId)
        .then((data) => sendResponse({ success: true, data } as MessageResponse))
        .catch((err) => sendResponse({ success: false, error: (err as Error).message } as MessageResponse));
      return true;
    }

    case "ENSURE_CONTENT_SCRIPT": {
      const { tabId } = req.payload as { tabId: number };
      chrome.scripting.executeScript({ target: { tabId }, files: [CONTENT_SCRIPT_FILE] })
        .then(() => sendResponse({ success: true } as MessageResponse))
        .catch((err) => sendResponse({ success: false, error: (err as Error).message } as MessageResponse));
      return true;
    }

    case "LLM_COMPLETE":
      handleLLMComplete(req.payload as LLMCompleteRequest)
        .then((data) => sendResponse({ success: true, data } as MessageResponse))
        .catch((err) =>
          sendResponse({ success: false, error: (err as Error).message } as MessageResponse)
        );
      return true; // async

    case "GET_SETTINGS":
      getSettings()
        .then((data) => sendResponse({ success: true, data } as MessageResponse))
        .catch((err) =>
          sendResponse({ success: false, error: (err as Error).message } as MessageResponse)
        );
      return true;

    case "SAVE_SETTINGS":
      saveSettings(req.payload as Record<string, unknown>)
        .then(() => sendResponse({ success: true } as MessageResponse))
        .catch((err) =>
          sendResponse({ success: false, error: (err as Error).message } as MessageResponse)
        );
      return true;

    case "GET_STATS":
      getStatistics()
        .then((data) => sendResponse({ success: true, data } as MessageResponse))
        .catch((err) =>
          sendResponse({ success: false, error: (err as Error).message } as MessageResponse)
        );
      return true;

    case "SAVE_STATS":
      saveStatistics(req.payload as Statistics)
        .then(() => sendResponse({ success: true } as MessageResponse))
        .catch((err) =>
          sendResponse({ success: false, error: (err as Error).message } as MessageResponse)
        );
      return true;

    case "PROBLEM_SOLVED": {
      const p = req.payload as { slug: string; title: string; difficulty: string };
      const entry = COMPANY_PROBLEMS.find(e => e.slug === p.slug);
      const problem: SolvedProblem = {
        slug: p.slug,
        title: p.title || p.slug,
        difficulty: (["Easy", "Medium", "Hard"].includes(p.difficulty) ? p.difficulty : "Medium") as "Easy" | "Medium" | "Hard",
        patterns: entry?.patterns ?? [],
        companies: entry?.companies ?? [],
        solvedAt: Date.now(),
      };
      if (DEBUG) console.log("[SW] PROBLEM_SOLVED:", problem);
      recordSolvedProblem(problem)
        .then(() => sendResponse({ success: true } as MessageResponse))
        .catch(err => sendResponse({ success: false, error: (err as Error).message } as MessageResponse));
      return true;
    }

    case "IMPORT_SOLVED": {
      importSolvedProblems()
        .then(imported => {
          if (DEBUG) console.log(`[SW] Imported ${imported} problems`);
          sendResponse({ success: true, data: { imported } } as MessageResponse);
        })
        .catch(err => sendResponse({ success: false, error: (err as Error).message } as MessageResponse));
      return true;
    }

    default:
      sendResponse({ success: false, error: `Unknown message type: ${req.type}` } as MessageResponse);
      return false;
  }
});

async function handleLLMComplete(req: LLMCompleteRequest): Promise<string> {
  const provider = await getActiveProvider();
  return provider.complete(req.prompt, req.systemPrompt, req.maxTokens);
}

async function importSolvedProblems(): Promise<number> {
  const userRes = await fetch("https://leetcode.com/graphql/", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: `query { userStatus { username isSignedIn } }` }),
  });
  const userData = await userRes.json();
  if (!userData?.data?.userStatus?.isSignedIn) throw new Error("Not logged in to LeetCode");

  const PROBLEMS_QUERY = `
    query problemsetQuestionList($limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(categorySlug: "" limit: $limit skip: $skip filters: $filters) {
        total: totalNum
        questions: data { title titleSlug difficulty topicTags { name } }
      }
    }
  `;

  // Reset stats before importing so the result reflects LeetCode exactly
  await saveStatistics({ solved: [], totalSolved: 0, byDifficulty: { Easy: 0, Medium: 0, Hard: 0 }, byPattern: {} });

  let skip = 0;
  const limit = 100;
  let total = Infinity;
  let imported = 0;

  while (skip < total) {
    const res = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: PROBLEMS_QUERY, variables: { limit, skip, filters: { status: "AC" } } }),
    });
    const json = await res.json();
    const page = json?.data?.problemsetQuestionList;
    if (!page) break;
    total = page.total;
    for (const p of page.questions) {
      const entry = COMPANY_PROBLEMS.find(e => e.slug === p.titleSlug);
      const diff = (["Easy", "Medium", "Hard"].includes(p.difficulty) ? p.difficulty : "Medium") as "Easy" | "Medium" | "Hard";
      await recordSolvedProblem({
        slug: p.titleSlug,
        title: p.title,
        difficulty: diff,
        patterns: entry?.patterns ?? p.topicTags.map((t: { name: string }) => t.name),
        companies: entry?.companies ?? [],
        solvedAt: Date.now(),
      });
      imported++;
    }
    skip += limit;
  }
  return imported;
}
