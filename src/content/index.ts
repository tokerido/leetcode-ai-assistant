import { getProblemContext, getProblemContextAsync, getProblemSlug } from "./leetcode";
import { hookMonacoAutocomplete } from "./monaco";

const DEBUG = false;
let lastSlug = "";
let navDebounce: ReturnType<typeof setTimeout> | null = null;

// Two-phase broadcast: send metadata immediately so the panel renders the
// problem within ~200ms, then a second update once Monaco is loaded so the
// code field is filled in.
async function broadcastContext() {
  const lite = getProblemContext(); // sync; code may be empty/partial
  chrome.runtime.sendMessage({ type: "PAGE_CONTEXT", payload: lite });

  const full = await getProblemContextAsync();
  // Only re-broadcast if the code actually filled in (avoid an empty-overwriting-empty no-op)
  if (full.code && full.code !== lite.code) {
    chrome.runtime.sendMessage({ type: "PAGE_CONTEXT", payload: full });
  }
}

// Initialize when page loads
async function init() {
  const slug = getProblemSlug();
  if (!slug) return;

  lastSlug = slug; // prevent locationchange from re-firing on initial load
  hookMonacoAutocomplete();
  injectSubmissionInterceptor();
  listenForAcceptedSubmission();

  await broadcastContext();
}

function injectSubmissionInterceptor() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("submission-interceptor.js");
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

function listenForAcceptedSubmission() {
  window.addEventListener("message", (event) => {
    if (
      event.source !== window ||
      event.data?.source !== "leetcode-ai-interceptor" ||
      event.data?.type !== "SUBMISSION_ACCEPTED"
    ) return;
    if (DEBUG) console.log("[Content] Intercepted accepted submission");
    const context = getProblemContext();
    chrome.runtime.sendMessage({ type: "PROBLEM_SOLVED", payload: context });
  });
}

// Respond to side panel requesting context
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_CONTEXT") {
    // Reply immediately with whatever we have right now so the panel renders fast.
    const lite = getProblemContext();
    sendResponse({ success: true, data: lite });
    // If code wasn't ready yet, await Monaco and push the full context as PAGE_CONTEXT.
    if (!lite.code) {
      getProblemContextAsync().then((full) => {
        if (full.code) chrome.runtime.sendMessage({ type: "PAGE_CONTEXT", payload: full });
      });
    }
    return false;
  }
});

// Detect LeetCode SPA navigation (history.pushState does not fire popstate)
function patchHistoryMethod(method: "pushState" | "replaceState") {
  const original = history[method].bind(history);
  history[method] = function (...args: Parameters<typeof history.pushState>) {
    original(...args);
    window.dispatchEvent(new Event("locationchange"));
  };
}
patchHistoryMethod("pushState");
patchHistoryMethod("replaceState");
window.addEventListener("popstate", () => window.dispatchEvent(new Event("locationchange")));

window.addEventListener("locationchange", () => {
  if (navDebounce) clearTimeout(navDebounce);
  navDebounce = setTimeout(async () => {
    const slug = getProblemSlug();
    if (!slug) {
      // Left a problem page — clear panel context
      lastSlug = "";
      chrome.runtime.sendMessage({ type: "PAGE_CONTEXT", payload: null });
      return;
    }
    // Re-hook Monaco and re-broadcast whenever the slug changes
    if (slug !== lastSlug) {
      lastSlug = slug;
      hookMonacoAutocomplete();
      await broadcastContext();
    }
  }, 300);
});

// Run init when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
