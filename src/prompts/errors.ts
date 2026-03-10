export const ERRORS_SYSTEM = `You are a debugging expert. Explain coding errors clearly and suggest fixes. Be concise and actionable.`;

export function buildErrorPrompt(code: string, error: string, language: string): string {
  return `I got this error while solving a LeetCode problem in ${language}:\n\nError: ${error}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nExplain the error and provide a fix.`;
}
