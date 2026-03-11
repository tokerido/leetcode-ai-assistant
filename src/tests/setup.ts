import "@testing-library/jest-dom";
import { vi } from "vitest";

// ── Chrome API mock ──────────────────────────────────────────────────────────

const storageStore: Record<string, unknown> = {};

const chromeMock = {
  storage: {
    sync: {
      get: vi.fn((keys: string | string[], cb: (r: Record<string, unknown>) => void) => {
        const keyList = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};
        for (const k of keyList) result[k] = storageStore[k];
        cb(result);
      }),
      set: vi.fn((items: Record<string, unknown>, cb?: () => void) => {
        Object.assign(storageStore, items);
        cb?.();
      }),
    },
    local: {
      get: vi.fn((key: string, cb: (r: Record<string, unknown>) => void) => {
        cb({ [key]: storageStore[key] });
      }),
      set: vi.fn((items: Record<string, unknown>, cb?: () => void) => {
        Object.assign(storageStore, items);
        cb?.();
      }),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn() },
    onInstalled: { addListener: vi.fn() },
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
  sidePanel: {
    setPanelBehavior: vi.fn(),
  },
};

// Attach to globalThis so any import that references `chrome` finds it
(globalThis as unknown as { chrome: typeof chromeMock }).chrome = chromeMock;

// Reset storage between tests
beforeEach(() => {
  Object.keys(storageStore).forEach((k) => delete storageStore[k]);
  vi.clearAllMocks();
});

export { chromeMock };
