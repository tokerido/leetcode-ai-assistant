# LeetCode AI Assistant

A Chrome Extension that supercharges your LeetCode practice with AI-powered hints, complexity analysis, error explanations, code optimization, and progress tracking — all inside a side panel while you code.

## Features

- **Hints**: Progressive hint reveal so you can unblock yourself without spoiling the solution
- **Complexity Analysis**: Instant time/space complexity breakdown of your current code
- **Error Explainer**: Paste a failing test case and get a plain-English explanation of the bug
- **Optimizer**: Get suggestions to improve runtime or memory usage
- **Statistics**: Automatically tracks problems you solve (detected via submission interception)
- **Train by Company**: Filter practice problems by the company you're targeting
- **Train by Weakness**: Identify and drill your weakest problem categories
- **Company Tags**: See which companies ask each problem directly on the problem page

## Demo / Screenshots

<!-- TODO: Add screenshots/demo once UI is ready -->

## Installation

### Prerequisites

- Node.js 18+
- Google Chrome

### Setup

```bash
git clone https://github.com/tokerido/leetcode-ai-assistant.git
cd leetcode-ai-assistant
npm install
npm run build
```

Then load the extension in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select the `dist/` folder

After any rebuild, click the **refresh icon** on the extension card to reload it.

### API Keys

Click the extension icon → open Settings, then enter your API key for whichever provider you want to use:

- **Claude** (Anthropic) — recommended
- **OpenAI** (GPT-4o)
- **Google Gemini**

## Usage

1. Navigate to any LeetCode problem (`leetcode.com/problems/...`)
2. Click the extension icon to open the side panel
3. Use the tabs across the top to access each feature
4. Your solved problems are tracked automatically when you get an **Accepted** submission

## Project Structure

```
src/
├── background/
│   └── service-worker.ts     # All LLM/network calls; message router
├── content/
│   └── index.ts              # Runs on leetcode.com; scrapes context, hooks Monaco
├── sidepanel/
│   └── App.tsx               # Main 8-tab UI panel
├── popup/
│   └── App.tsx               # Settings page (API keys + provider selection)
├── components/
│   └── Statistics.tsx        # Stats UI component
├── llm/
│   ├── router.ts             # Picks active LLM provider
│   ├── claude.ts
│   ├── openai.ts
│   └── gemini.ts
└── data/
    └── company-tags.ts       # Static problem→company dataset (57 problems)
public/
└── submission-interceptor.js # Intercepts XHR/fetch to detect accepted submissions
```

## Tech Stack

- **Chrome Extension** — Manifest V3
- **TypeScript** + **React** + **Tailwind CSS**
- **Vite** + `vite-plugin-web-extension`
- **LLM Providers**: Claude (`claude-opus-4-6`), OpenAI (`gpt-4o`), Gemini (`gemini-2.0-flash`)

## Testing

```bash
npm run lint    # TypeScript type check
npm run build   # Production build (must exit cleanly before committing)
```

## Contributing

- Branch naming: `feature/<name>` or `fix/<name>`
- Commit format: `<type>: <description>` (feat, fix, refactor, docs, test, chore)
- All changes go through feature branches — never commit directly to main
- Merge only after user approval

## License

MIT
