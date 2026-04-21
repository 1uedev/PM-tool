import { ClaudeAdapter } from "./claude-adapter.js";

export function getAiProvider() {
  const provider = process.env.AI_PROVIDER ?? "claude";

  switch (provider) {
    case "claude":
      if (!process.env.AI_CLAUDE_API_KEY) {
        throw new Error("AI_CLAUDE_API_KEY is not configured");
      }
      return new ClaudeAdapter();
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

// Returns true if an AI provider is configured and usable
export function isAiAvailable() {
  const provider = process.env.AI_PROVIDER ?? "claude";
  if (provider === "claude") return !!process.env.AI_CLAUDE_API_KEY;
  return false;
}
