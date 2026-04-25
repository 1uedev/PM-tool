import prisma from "@/lib/prisma.js";
import { ClaudeAdapter } from "./claude-adapter.js";
import { OpenAiAdapter } from "./openai-adapter.js";

/**
 * Load AI config from DB. Falls back to env vars if no DB record exists.
 * Returns a plain config object — never throws.
 */
export async function getAiConfig() {
  try {
    const record = await prisma.aiConfig.findUnique({ where: { id: "singleton" } });
    if (record && record.provider !== "disabled" && record.apiKey) {
      return {
        provider: record.provider,
        model: record.model,
        apiKey: record.apiKey,
        timeoutMs: record.timeoutMs,
        maxTokens: record.maxTokens,
      };
    }
  } catch {
    // DB not available — fall through to env fallback
  }

  // Env-var fallback (for initial setup / CI)
  const provider = process.env.AI_PROVIDER ?? "disabled";
  const apiKey =
    provider === "claude" ? (process.env.AI_CLAUDE_API_KEY ?? "") :
    provider === "openai"  ? (process.env.AI_OPENAI_API_KEY ?? "")  : "";

  return {
    provider,
    model: provider === "claude" ? "claude-sonnet-4-6" : provider === "openai" ? "gpt-4o" : "",
    apiKey,
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS ?? "30000", 10),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS ?? "2048", 10),
  };
}

/** Returns true if a usable AI provider is configured */
export function isAiAvailable(config) {
  return config.provider !== "disabled" && Boolean(config.apiKey);
}

/** Returns an adapter instance for the given config. Throws if provider unknown. */
export function getAiProvider(config) {
  switch (config.provider) {
    case "claude": return new ClaudeAdapter(config);
    case "openai": return new OpenAiAdapter(config);
    default: throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}
