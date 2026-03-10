export const OPTIMIZE_SYSTEM = `You are an expert competitive programmer. Optimize the given solution for better time/space complexity. Show the optimized code with explanation of improvements.`;

export function buildOptimizePrompt(code: string, problemTitle: string, language: string): string {
  return `Optimize this ${language} solution for "${problemTitle}":\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide an optimized solution with:\n1. The optimized code\n2. What changed and why\n3. New complexity vs old complexity`;
}
