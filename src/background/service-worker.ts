import { getActiveProvider } from "../llm/router";
import type { LLMCompleteRequest, MessageResponse } from "../llm/types";
import { getSettings, saveSettings } from "../storage/settings";
import { getStatistics, saveStatistics } from "../storage/statistics";
import type { Statistics } from "../storage/statistics";

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const req = message as { type: string; payload?: unknown };

  switch (req.type) {
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

    default:
      sendResponse({ success: false, error: `Unknown message type: ${req.type}` } as MessageResponse);
      return false;
  }
});

async function handleLLMComplete(req: LLMCompleteRequest): Promise<string> {
  const provider = await getActiveProvider();
  return provider.complete(req.prompt, req.systemPrompt);
}
