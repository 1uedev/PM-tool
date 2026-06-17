import prisma from "@/lib/prisma.js";
import { requireAdmin } from "@/lib/middleware/auth-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { encryptSecret } from "@/lib/crypto.js";

// GET /api/admin/ai — return current AI config (API key masked)
export async function GET() {
  const { response: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const record = await prisma.aiConfig.findUnique({ where: { id: "singleton" } });
  if (!record) {
    // Return defaults derived from env vars (no key exposed)
    return successResponse({
      provider: process.env.AI_PROVIDER ?? "disabled",
      model: "",
      apiKeySet: !!(process.env.AI_CLAUDE_API_KEY || process.env.AI_OPENAI_API_KEY),
      baseUrl: process.env.AI_OLLAMA_BASE_URL ?? "",
      timeoutMs: parseInt(process.env.AI_TIMEOUT_MS ?? "30000", 10),
      maxTokens: parseInt(process.env.AI_MAX_TOKENS ?? "2048", 10),
      source: "env",
    });
  }

  return successResponse({
    provider: record.provider,
    model: record.model,
    apiKeySet: record.apiKey.length > 0,
    baseUrl: record.baseUrl ?? "",
    timeoutMs: record.timeoutMs,
    maxTokens: record.maxTokens,
    source: "db",
  });
}

// PATCH /api/admin/ai — save AI config to DB
export async function PATCH(request) {
  const { response: authErr } = await requireAdmin();
  if (authErr) return authErr;

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Ungültiger JSON-Body", 400);
  }
  const { provider, model, apiKey, timeoutMs, maxTokens, baseUrl } = body;

  if (!provider) return errorResponse("VALIDATION_ERROR", "provider ist erforderlich", 400);
  if (!["claude", "openai", "ollama", "disabled"].includes(provider)) {
    return errorResponse("VALIDATION_ERROR", "Ungültiger Provider", 400);
  }

  // Ollama: validate the server URL (admin-only, but reject obvious mistakes)
  const trimmedBaseUrl = typeof baseUrl === "string" ? baseUrl.trim() : "";
  if (provider === "ollama" && trimmedBaseUrl) {
    try {
      const u = new URL(trimmedBaseUrl);
      if (!["http:", "https:"].includes(u.protocol)) throw new Error();
    } catch {
      return errorResponse("VALIDATION_ERROR", "Ungültige Ollama-Server-URL (http/https erforderlich)", 400);
    }
  }

  // Load existing record so we can preserve the API key if not provided
  const existing = await prisma.aiConfig.findUnique({ where: { id: "singleton" } });

  const data = {
    provider,
    model: model ?? "",
    baseUrl: provider === "ollama" ? trimmedBaseUrl : "",
    timeoutMs: timeoutMs ?? 30000,
    maxTokens: maxTokens ?? 2048,
  };

  // API key: Ollama needs none. Otherwise only update if explicitly provided
  // (non-empty); stored encrypted (AES-GCM) so the DB file does not expose it.
  if (provider === "ollama") {
    data.apiKey = "";
  } else if (typeof apiKey === "string" && apiKey.length > 0) {
    data.apiKey = encryptSecret(apiKey);
  } else if (existing) {
    data.apiKey = existing.apiKey; // preserve existing key
  } else {
    data.apiKey = "";
  }

  try {
    await prisma.aiConfig.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...data },
      update: data,
    });
  } catch (error) {
    console.error("[PATCH /api/admin/ai]", error);
    return errorResponse("SERVER_ERROR", "Konfiguration konnte nicht gespeichert werden", 500);
  }

  return successResponse({ saved: true, provider, apiKeySet: data.apiKey.length > 0 });
}
