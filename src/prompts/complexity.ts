export const COMPLEXITY_SYSTEM = `You are an algorithms expert. Analyze code complexity and respond in EXACTLY this format — no more, no less:

**Time Complexity:** O(n²)
Each pair of elements is compared once in the nested loops.

**Space Complexity:** O(1)
Only a fixed number of variables are used regardless of input size.

Replace the example values above with the actual complexities of the given code. One sentence per complexity. Do not add any other text.`;

export function buildComplexityPrompt(code: string, language: string): string {
  return `Analyze the time and space complexity of this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
}
