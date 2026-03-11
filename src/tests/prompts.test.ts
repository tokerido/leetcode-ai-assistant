import { describe, it, expect } from "vitest";
import { buildHintsPrompt, HINTS_SYSTEM } from "../prompts/hints";
import { buildComplexityPrompt, COMPLEXITY_SYSTEM } from "../prompts/complexity";
import { buildErrorPrompt, ERRORS_SYSTEM } from "../prompts/errors";
import { buildOptimizePrompt, OPTIMIZE_SYSTEM } from "../prompts/optimize";
import { buildAutocompletePrompt, AUTOCOMPLETE_SYSTEM } from "../prompts/autocomplete";

describe("Hints prompt", () => {
  it("includes the problem title and description", () => {
    const prompt = buildHintsPrompt("Two Sum", "Given an array of integers...");
    expect(prompt).toContain("Two Sum");
    expect(prompt).toContain("Given an array of integers");
  });

  it("asks for 5 hints as a JSON array", () => {
    const prompt = buildHintsPrompt("Two Sum", "desc");
    expect(prompt).toContain("5");
    expect(prompt).toContain("JSON array");
  });

  it("system prompt instructs progressive hints without spoiling solution", () => {
    expect(HINTS_SYSTEM).toMatch(/progressive/i);
    expect(HINTS_SYSTEM).toMatch(/never give away/i);
  });
});

describe("Complexity prompt", () => {
  it("includes the language and code", () => {
    const prompt = buildComplexityPrompt("def foo(): pass", "python");
    expect(prompt).toContain("python");
    expect(prompt).toContain("def foo(): pass");
  });

  it("asks for both time and space complexity", () => {
    const prompt = buildComplexityPrompt("int x = 1;", "java");
    expect(prompt).toContain("Time Complexity");
    expect(prompt).toContain("Space Complexity");
  });

  it("system prompt mentions Big-O", () => {
    expect(COMPLEXITY_SYSTEM).toMatch(/big-o/i);
  });
});

describe("Error prompt", () => {
  it("includes code, error message, and language", () => {
    const prompt = buildErrorPrompt("x = 1/0", "ZeroDivisionError", "python");
    expect(prompt).toContain("x = 1/0");
    expect(prompt).toContain("ZeroDivisionError");
    expect(prompt).toContain("python");
  });

  it("asks for a fix", () => {
    const prompt = buildErrorPrompt("code", "error", "js");
    expect(prompt).toContain("fix");
  });

  it("system prompt is concise and actionable", () => {
    expect(ERRORS_SYSTEM).toMatch(/fix/i);
  });
});

describe("Optimize prompt", () => {
  it("includes code, problem title, and language", () => {
    const prompt = buildOptimizePrompt("O(n^2) code", "Two Sum", "python");
    expect(prompt).toContain("O(n^2) code");
    expect(prompt).toContain("Two Sum");
    expect(prompt).toContain("python");
  });

  it("asks for optimized code and complexity comparison", () => {
    const prompt = buildOptimizePrompt("code", "title", "js");
    expect(prompt).toContain("optimized");
    expect(prompt).toContain("complexity");
  });

  it("system prompt mentions competitive programming", () => {
    expect(OPTIMIZE_SYSTEM).toMatch(/competitive programmer/i);
  });
});

describe("Autocomplete prompt", () => {
  it("marks cursor position with |", () => {
    const code = "def solution():\n    x = 1\n    return x";
    const prompt = buildAutocompletePrompt(code, 1, 9, "python");
    expect(prompt).toContain("|");
  });

  it("includes only code before cursor", () => {
    const code = "line0\nline1\nline2";
    const prompt = buildAutocompletePrompt(code, 1, 3, "python");
    expect(prompt).toContain("lin"); // first 3 chars of line1
    expect(prompt).not.toContain("line2");
  });

  it("includes the language", () => {
    const prompt = buildAutocompletePrompt("code", 0, 0, "typescript");
    expect(prompt).toContain("typescript");
  });

  it("system prompt says return only completion text", () => {
    expect(AUTOCOMPLETE_SYSTEM).toMatch(/only/i);
    expect(AUTOCOMPLETE_SYSTEM).toMatch(/completion/i);
  });
});
