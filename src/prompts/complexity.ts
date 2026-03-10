export const COMPLEXITY_SYSTEM = `You are an algorithms expert. Analyze code and return time and space complexity in Big-O notation with a brief explanation. Be concise and accurate.`;

export function buildComplexityPrompt(code: string, language: string): string {
  return `Analyze the time and space complexity of this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide:\n1. Time Complexity: O(...) - brief explanation\n2. Space Complexity: O(...) - brief explanation`;
}
