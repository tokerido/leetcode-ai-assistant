export const COMPLEXITY_SYSTEM = `You are an algorithms expert. Analyze code complexity. Always respond using EXACTLY this template, nothing more:

**Time Complexity:** O(...)
[one sentence explanation]

**Space Complexity:** O(...)
[one sentence explanation]`;

export function buildComplexityPrompt(code: string, language: string): string {
  return `Analyze the time and space complexity of this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
}
