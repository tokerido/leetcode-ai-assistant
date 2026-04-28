import { getProblemContext, getProblemContextAsync, getProblemSlug } from "./leetcode";
import { hookMonacoAutocomplete } from "./monaco";

const DEBUG = false;

// Initialize when page loads
async function init() {
  const slug = getProblemSlug();
  if (!slug) return;

  hookMonacoAutocomplete();
  injectSubmissionInterceptor();
  listenForAcceptedSubmission();

  // Wait for Monaco before broadcasting context so code is never empty
  const context = await getProblemContextAsync();
  chrome.runtime.sendMessage({ type: "PAGE_CONTEXT", payload: context });
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
    getProblemContextAsync().then((data) => sendResponse({ success: true, data }));
    return true; // keep message channel open for async response
  }
});

// Run init when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
