export interface ProblemContext {
  slug: string;
  title: string;
  description: string;
  language: string;
  code: string;
  difficulty: string;
  companies: string[];
}

export function getProblemSlug(): string {
  const match = window.location.pathname.match(/\/problems\/([^/]+)/);
  return match ? match[1] : "";
}

export function getProblemTitle(): string {
  const el =
    document.querySelector('[data-cy="question-title"]') ||
    document.querySelector(".text-title-large") ||
    document.querySelector("h4") ||
    document.querySelector('[class*="title"]');
  return el?.textContent?.trim() || getProblemSlug();
}

export function getProblemDescription(): string {
  const el =
    document.querySelector('[data-cy="question-content"]') ||
    document.querySelector(".question-content__JfgR") ||
    document.querySelector('[class*="description"]') ||
    document.querySelector(".elfjS");
  return el?.textContent?.trim() || "";
}

export function getEditorLanguage(): string {
  const el =
    document.querySelector(".ant-select-selection-item") ||
    document.querySelector('[data-cy="lang-select"]') ||
    document.querySelector('button[id*="headlessui-listbox-button"]');
  return el?.textContent?.trim()?.toLowerCase() || "python3";
}

export function getEditorCode(): string {
  // Try Monaco editor
  try {
    const monacoGlobal = (window as unknown as { monaco?: { editor?: { getModels?: () => { getValue: () => string }[] } } }).monaco;
    if (monacoGlobal?.editor?.getModels) {
      const models = monacoGlobal.editor.getModels();
      if (models.length > 0) {
        return models[0].getValue();
      }
    }
  } catch {
    // fallback
  }

  // Try CodeMirror
  const cmEditor = document.querySelector(".CodeMirror") as HTMLElement & { CodeMirror?: { getValue: () => string } };
  if (cmEditor?.CodeMirror) {
    return cmEditor.CodeMirror.getValue();
  }

  // Fallback: get visible text from editor
  const editorEl = document.querySelector(".view-lines");
  return editorEl?.textContent || "";
}

export function getDifficulty(): string {
  const el =
    document.querySelector('[diff]') ||
    document.querySelector(".text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard") ||
    document.querySelector('[class*="difficulty"]');
  const text = el?.textContent?.trim() || "Medium";
  if (text.includes("Easy")) return "Easy";
  if (text.includes("Hard")) return "Hard";
  return "Medium";
}

export function getErrorOutput(): string {
  const errorEl =
    document.querySelector('[data-e2e-locator="console-result"]') ||
    document.querySelector(".error-msg___V8kpZ") ||
    document.querySelector('[class*="error"]');
  return errorEl?.textContent?.trim() || "";
}

export function getProblemContext(): ProblemContext {
  return {
    slug: getProblemSlug(),
    title: getProblemTitle(),
    description: getProblemDescription(),
    language: getEditorLanguage(),
    code: getEditorCode(),
    difficulty: getDifficulty(),
    companies: [],
  };
}
