import prisma from "@/lib/prisma.js";
import { requireAdmin } from "@/lib/middleware/auth-guard.js";
import { getAiProvider } from "@/lib/ai/provider-factory.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { decryptSecret } from "@/lib/crypto.js";

// POST /api/admin/ai/test — test a given provider config
export async function POST(request) {
  const { response: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const body = await request.json();
  const { provider, model, apiKey: bodyApiKey } = body;

  if (!provider || provider === "disabled") {
    return errorResponse("VALIDATION_ERROR", "Kein Provider ausgewählt", 400);
  }

  // Resolve API key: use body key if provided, otherwise fall back to stored key
  let apiKey = bodyApiKey;
  if (!apiKey) {
    const record = await prisma.aiConfig.findUnique({ where: { id: "singleton" } });
    apiKey = decryptSecret(record?.apiKey ?? "");
  }

  if (!apiKey) {
    return errorResponse("VALIDATION_ERROR", "Kein API-Key vorhanden", 400);
  }

  const config = { provider, model, apiKey, timeoutMs: 10000, maxTokens: 10 };

  try {
    const adapter = getAiProvider(config);
    const reply = await adapter.testConnection();
    return successResponse({ ok: true, message: `Verbindung erfolgreich — Antwort: "${reply.trim()}"` });
  } catch (e) {
    return successResponse({ ok: false, message: e.message });
  }
}
