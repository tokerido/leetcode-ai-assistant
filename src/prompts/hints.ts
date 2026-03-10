export const HINTS_SYSTEM = `You are a coding interview coach. Give hints progressively — start very vague and general, then get more specific with each subsequent hint. Never give away the full solution. Format: return a JSON array of hint strings, from most vague to most specific.`;

export function buildHintsPrompt(title: string, description: string): string {
  return `Problem: ${title}\n\nDescription: ${description}\n\nGenerate 5 progressive hints as a JSON array. Example: ["Think about the data structure...", "Consider using a hash map...", ...]`;
}
