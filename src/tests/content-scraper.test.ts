import { describe, it, expect, beforeEach } from "vitest";
import {
  getProblemSlug,
  getProblemTitle,
  getProblemDescription,
  getEditorLanguage,
  getDifficulty,
  getProblemContext,
} from "../content/leetcode";

function setLocation(path: string) {
  Object.defineProperty(window, "location", {
    value: { pathname: path },
    writable: true,
  });
}

function setHTML(html: string) {
  document.body.innerHTML = html;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

// ── Slug ─────────────────────────────────────────────────────────────────────

describe("getProblemSlug", () => {
  it("extracts slug from /problems/<slug>/", () => {
    setLocation("/problems/two-sum/");
    expect(getProblemSlug()).toBe("two-sum");
  });

  it("extracts slug from /problems/<slug>/description/", () => {
    setLocation("/problems/longest-substring-without-repeating-characters/description/");
    expect(getProblemSlug()).toBe("longest-substring-without-repeating-characters");
  });

  it("returns empty string on non-problem pages", () => {
    setLocation("/explore/");
    expect(getProblemSlug()).toBe("");
  });
});

// ── Title ─────────────────────────────────────────────────────────────────────

describe("getProblemTitle", () => {
  it("reads from .text-title-large", () => {
    setLocation("/problems/two-sum/");
    setHTML('<div class="text-title-large">Two Sum</div>');
    expect(getProblemTitle()).toBe("Two Sum");
  });

  it("falls back to slug when no element found", () => {
    setLocation("/problems/two-sum/");
    setHTML("");
    expect(getProblemTitle()).toBe("two-sum");
  });
});

// ── Description ───────────────────────────────────────────────────────────────

describe("getProblemDescription", () => {
  it("reads from .elfjS element", () => {
    setHTML('<div class="elfjS">Given an array of integers...</div>');
    expect(getProblemDescription()).toBe("Given an array of integers...");
  });

  it("returns empty string when no element found", () => {
    setHTML("");
    expect(getProblemDescription()).toBe("");
  });
});

// ── Language ──────────────────────────────────────────────────────────────────

describe("getEditorLanguage", () => {
  it("reads from .ant-select-selection-item", () => {
    setHTML('<div class="ant-select-selection-item">Python3</div>');
    expect(getEditorLanguage()).toBe("python3");
  });

  it("defaults to python3 when no element found", () => {
    setHTML("");
    expect(getEditorLanguage()).toBe("python3");
  });
});

// ── Difficulty ────────────────────────────────────────────────────────────────

describe("getDifficulty", () => {
  it("returns Easy", () => {
    setHTML('<span class="text-difficulty-easy">Easy</span>');
    expect(getDifficulty()).toBe("Easy");
  });

  it("returns Hard", () => {
    setHTML('<span class="text-difficulty-hard">Hard</span>');
    expect(getDifficulty()).toBe("Hard");
  });

  it("defaults to Medium when no element found", () => {
    setHTML("");
    expect(getDifficulty()).toBe("Medium");
  });
});

// ── Full context ──────────────────────────────────────────────────────────────

describe("getProblemContext", () => {
  it("returns a complete context object", () => {
    setLocation("/problems/two-sum/");
    setHTML(`
      <div class="text-title-large">Two Sum</div>
      <div class="elfjS">Given an array...</div>
      <div class="ant-select-selection-item">Python3</div>
      <span class="text-difficulty-easy">Easy</span>
    `);
    const ctx = getProblemContext();
    expect(ctx.slug).toBe("two-sum");
    expect(ctx.title).toBe("Two Sum");
    expect(ctx.description).toBe("Given an array...");
    expect(ctx.language).toBe("python3");
    expect(ctx.difficulty).toBe("Easy");
    expect(ctx.code).toBeDefined();
  });
});
