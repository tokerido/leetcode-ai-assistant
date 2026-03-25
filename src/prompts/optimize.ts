export const OPTIMIZE_SYSTEM = `You are an expert competitive programmer. Optimize the given solution for better time/space complexity. Do NOT restate or analyze the original code — go directly to the improved solution. Format your response as:
1. Optimized code (complete, runnable)
2. What changed and why (2-4 bullet points)
3. Complexity: old → new`;

export function buildOptimizePrompt(code: string, problemTitle: string, language: string): string {
  return `Optimize this ${language} solution for "${problemTitle}":\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide an optimized solution with:\n1. The optimized code\n2. What changed and why\n3. New complexity vs old complexity`;
}
