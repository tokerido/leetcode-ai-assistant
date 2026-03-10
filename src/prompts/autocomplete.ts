export const AUTOCOMPLETE_SYSTEM = `You are a code completion assistant. Complete the code at the cursor position. Return ONLY the completion text (what comes after the cursor), nothing else. No explanations, no markdown, just raw code.`;

export function buildAutocompletePrompt(
  code: string,
  cursorLine: number,
  cursorColumn: number,
  language: string
): string {
  const lines = code.split("\n");
  const beforeCursor = lines.slice(0, cursorLine).join("\n") + "\n" + lines[cursorLine]?.slice(0, cursorColumn);
  return `Complete this ${language} code at the cursor position (marked with |):\n\n${beforeCursor}|\n\nReturn only the completion text.`;
}
