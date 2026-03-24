# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build   # Production build → dist/
npm run dev     # Watch mode (rebuilds on file save)
npm run lint    # TypeScript type check (tsc --noEmit)
```

After every change, run `npm run build` and confirm it exits cleanly before committing. Then commit and push:

```bash
git add <files>
git commit -m "type: description"
git push
```

To load/reload in Chrome: `chrome://extensions` → Developer mode → Load unpacked → select `dist/`. After rebuilding, click the refresh icon on the extension card.

## Architecture

This is a Chrome Extension (Manifest V3). All source is TypeScript/React, compiled by Vite + `vite-plugin-web-extension` into `dist/`.

### Message-passing flow

```
leetcode.com page
  └─ src/content/index.ts        scrapes problem context, hooks Monaco, observes submissions
       │  chrome.runtime.sendMessage()
       ▼
  src/background/service-worker.ts   routes all messages; makes ALL network calls (LLM APIs)
       │  sendResponse()
       ▼
  src/sidepanel/App.tsx              renders the 8-tab UI panel
```

**Critical rule:** LLM/API calls must go through the service worker, never directly from the sidepanel or content script — LeetCode's CSP blocks cross-origin fetches from content scripts, and the sidepanel has no `host_permissions` context.

### Message types

| Type | Direction | Purpose |
|---|---|---|
| `LLM_COMPLETE` | sidepanel → background | Send prompt, get LLM response |
| `GET_SETTINGS` / `SAVE_SETTINGS` | any → background | `chrome.storage.sync` (API keys, active provider) |
| `GET_STATS` / `SAVE_STATS` | any → background | `chrome.storage.local` (solved problems) |
| `PAGE_CONTEXT` | content → sidepanel | Push problem data when page loads |
| `GET_CONTEXT` | sidepanel → content | Pull problem data on demand |
| `PROBLEM_SOLVED` | content → background | Fires when "Accepted" detected in DOM |

### LLM layer (`src/llm/`)

`router.ts` reads `activeProvider` from `chrome.storage.sync` and instantiates the right class. Each provider (`claude.ts`, `openai.ts`, `gemini.ts`) implements `LLMProvider` with `complete()` and `stream()` using native `fetch`.

- Claude: `claude-opus-4-6`, Anthropic Messages API
- OpenAI: `gpt-4o`, Chat Completions API
- Gemini: `gemini-2.5-flash`, `v1beta` endpoint

### Key constraints

- `vite-plugin-web-extension` requires `additionalInputs` as a **flat array of strings**, not `{ scripts, html }` object.
- The `action` in `manifest.json` must have **no `default_popup`** — otherwise `chrome.action.onClicked` never fires and the side panel never opens. Side panel opens via `setPanelBehavior({ openPanelOnActionClick: true })` set in `onInstalled`.
- `chrome.tabs.query` in the sidepanel requires the `"tabs"` permission in the manifest.
- No icons are configured; Chrome shows a default puzzle-piece icon.

### Submission Interception

`public/submission-interceptor.js` is injected into the page to intercept XHR/fetch calls and detect when a submission returns "Accepted". It fires a custom DOM event that `src/content/index.ts` listens to and forwards as a `PROBLEM_SOLVED` message to the background service worker, which then updates `chrome.storage.local` stats.

### Data

`src/data/company-tags.ts` is a static bundled dataset (57 problems). It is imported directly — no API call. The Train by Company and Train Weakness features filter this dataset against `chrome.storage.local` stats.

## Planned Features

### Streaming LLM Responses
LLM responses currently use request/response (`sendMessage`) — users wait for the full response before seeing anything. A streaming upgrade using Chrome port-based messaging (`chrome.runtime.connect()`) is the next planned feature after the current branch merges. See memory file `project_streaming_future.md` for the full design.
