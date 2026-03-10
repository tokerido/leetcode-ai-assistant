import { getProblemContext, getProblemSlug } from "./leetcode";
import { hookMonacoAutocomplete } from "./monaco";

// Initialize when page loads
function init() {
  const slug = getProblemSlug();
  if (!slug) return;

  // Hook Monaco autocomplete
  hookMonacoAutocomplete();

  // Observe submission results for statistics tracking
  observeSubmissionResults();

  // Notify sidepanel that we're on a problem page
  const context = getProblemContext();
  chrome.runtime.sendMessage({ type: "PAGE_CONTEXT", payload: context });
}

function observeSubmissionResults() {
  const observer = new MutationObserver(() => {
    // Look for "Accepted" submission result
    const resultEl =
      document.querySelector('[data-e2e-locator="submission-result"]') ||
      document.querySelector(".text-green-s") ||
      document.querySelector('[class*="accepted"]');

    if (resultEl?.textContent?.includes("Accepted")) {
      const context = getProblemContext();
      chrome.runtime.sendMessage({
        type: "PROBLEM_SOLVED",
        payload: context,
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Respond to side panel requesting context
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_CONTEXT") {
    sendResponse({ success: true, data: getProblemContext() });
  }
});

// Run init when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
