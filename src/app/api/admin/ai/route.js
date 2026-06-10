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
      timeoutMs: parseInt(process.env.AI_TIMEOUT_MS ?? "30000", 10),
      maxTokens: parseInt(process.env.AI_MAX_TOKENS ?? "2048", 10),
      source: "env",
    });
  }

  return successResponse({
    provider: record.provider,
    model: record.model,
    apiKeySet: record.apiKey.length > 0,
    timeoutMs: record.timeoutMs,
    maxTokens: record.maxTokens,
    source: "db",
  });
}

// PATCH /api/admin/ai — save AI config to DB
export async function PATCH(request) {
  const { response: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const body = await request.json();
  const { provider, model, apiKey, timeoutMs, maxTokens } = body;

  if (!provider) return errorResponse("VALIDATION_ERROR", "provider ist erforderlich", 400);
  if (!["claude", "openai", "disabled"].includes(provider)) {
    return errorResponse("VALIDATION_ERROR", "Ungültiger Provider", 400);
  }

  // Load existing record so we can preserve the API key if not provided
  const existing = await prisma.aiConfig.findUnique({ where: { id: "singleton" } });

  const data = {
    provider,
    model: model ?? "",
    timeoutMs: timeoutMs ?? 30000,
    maxTokens: maxTokens ?? 2048,
  };

  // Only update apiKey if explicitly provided (non-empty string).
  // Stored encrypted (AES-GCM) so the DB file does not expose it.
  if (typeof apiKey === "string" && apiKey.length > 0) {
    data.apiKey = encryptSecret(apiKey);
  } else if (existing) {
    data.apiKey = existing.apiKey; // preserve existing key
  } else {
    data.apiKey = "";
  }

  await prisma.aiConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  return successResponse({ saved: true, provider, apiKeySet: data.apiKey.length > 0 });
}
