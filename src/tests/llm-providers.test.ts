import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClaudeProvider } from "../llm/claude";
import { OpenAIProvider } from "../llm/openai";
import { GeminiProvider } from "../llm/gemini";

function makeFetchOk(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

function makeFetchError(status: number, text: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: async () => text,
    json: async () => ({}),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// ── Claude ───────────────────────────────────────────────────────────────────

describe("ClaudeProvider", () => {
  it("sends correct headers and body", async () => {
    const fetch = makeFetchOk({ content: [{ text: "hello" }] });
    vi.stubGlobal("fetch", fetch);

    const provider = new ClaudeProvider("test-key");
    await provider.complete("user prompt", "system prompt");

    const [url, options] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(options.headers).toMatchObject({
      "x-api-key": "test-key",
      "anthropic-version": "2023-06-01",
    });
    const body = JSON.parse(options.body as string);
    expect(body.model).toBe("claude-opus-4-6");
    expect(body.system).toBe("system prompt");
    expect(body.messages[0]).toEqual({ role: "user", content: "user prompt" });
  });

  it("returns the text from the response", async () => {
    vi.stubGlobal("fetch", makeFetchOk({ content: [{ text: "result text" }] }));
    const provider = new ClaudeProvider("key");
    const result = await provider.complete("p", "s");
    expect(result).toBe("result text");
  });

  it("throws on non-OK response", async () => {
    vi.stubGlobal("fetch", makeFetchError(401, "Unauthorized"));
    const provider = new ClaudeProvider("bad-key");
    await expect(provider.complete("p", "s")).rejects.toThrow("Claude API error: 401");
  });
});

// ── OpenAI ───────────────────────────────────────────────────────────────────

describe("OpenAIProvider", () => {
  it("sends correct headers and body", async () => {
    const fetch = makeFetchOk({ choices: [{ message: { content: "hi" } }] });
    vi.stubGlobal("fetch", fetch);

    const provider = new OpenAIProvider("oai-key");
    await provider.complete("user prompt", "system prompt");

    const [url, options] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(options.headers).toMatchObject({ Authorization: "Bearer oai-key" });
    const body = JSON.parse(options.body as string);
    expect(body.model).toBe("gpt-4o");
    expect(body.messages[0]).toEqual({ role: "system", content: "system prompt" });
    expect(body.messages[1]).toEqual({ role: "user", content: "user prompt" });
  });

  it("returns the message content", async () => {
    vi.stubGlobal("fetch", makeFetchOk({ choices: [{ message: { content: "answer" } }] }));
    const provider = new OpenAIProvider("key");
    expect(await provider.complete("p", "s")).toBe("answer");
  });

  it("throws on non-OK response", async () => {
    vi.stubGlobal("fetch", makeFetchError(429, "Rate limited"));
    const provider = new OpenAIProvider("key");
    await expect(provider.complete("p", "s")).rejects.toThrow("OpenAI API error: 429");
  });
});

// ── Gemini ───────────────────────────────────────────────────────────────────

describe("GeminiProvider", () => {
  it("sends correct URL with API key", async () => {
    const fetch = makeFetchOk({
      candidates: [{ content: { parts: [{ text: "gemini reply" }] } }],
    });
    vi.stubGlobal("fetch", fetch);

    const provider = new GeminiProvider("gemini-key");
    await provider.complete("user prompt", "system prompt");

    const [url] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("gemini-key");
    expect(url).toContain("generativelanguage.googleapis.com");
    expect(url).toContain("v1beta");
    expect(url).toContain("gemini-2.0-flash");
  });

  it("merges system prompt into user message (no system_instruction field)", async () => {
    const fetch = makeFetchOk({
      candidates: [{ content: { parts: [{ text: "ok" }] } }],
    });
    vi.stubGlobal("fetch", fetch);

    const provider = new GeminiProvider("key");
    await provider.complete("my prompt", "be helpful");

    const [, options] = fetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);

    expect(body).not.toHaveProperty("system_instruction");
    expect(body.contents[0].parts[0].text).toContain("be helpful");
    expect(body.contents[0].parts[0].text).toContain("my prompt");
  });

  it("returns the text from candidates", async () => {
    vi.stubGlobal("fetch", makeFetchOk({
      candidates: [{ content: { parts: [{ text: "gemini answer" }] } }],
    }));
    const provider = new GeminiProvider("key");
    expect(await provider.complete("p", "s")).toBe("gemini answer");
  });

  it("throws on non-OK response", async () => {
    vi.stubGlobal("fetch", makeFetchError(400, '{"error":"bad"}'));
    const provider = new GeminiProvider("key");
    await expect(provider.complete("p", "s")).rejects.toThrow("Gemini API error: 400");
  });
});
