import { requireAdmin } from "@/lib/middleware/auth-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { listOllamaModels } from "@/lib/ai/ollama-adapter.js";
import { OLLAMA_DEFAULT_BASE_URL } from "@/lib/constants.js";

// POST /api/admin/ai/ollama-models — list locally installed Ollama models
// Body: { baseUrl?: string }
export async function POST(request) {
  const { response: authErr } = await requireAdmin();
  if (authErr) return authErr;

  let body = {};
  try {
    body = await request.json();
  } catch {
    // empty body → use default base URL
  }

  const baseUrl =
    (typeof body.baseUrl === "string" && body.baseUrl.trim()) || OLLAMA_DEFAULT_BASE_URL;

  // Validate the URL (admin-only, but reject obvious mistakes)
  try {
    const u = new URL(baseUrl);
    if (!["http:", "https:"].includes(u.protocol)) throw new Error();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Ungültige Ollama-Server-URL (http/https erforderlich)", 400);
  }

  try {
    const models = await listOllamaModels(baseUrl, { timeoutMs: 5000 });
    return successResponse({ models });
  } catch (e) {
    const message =
      e.name === "AbortError"
        ? `Zeitüberschreitung — ist Ollama unter ${baseUrl} erreichbar?`
        : `Ollama nicht erreichbar (${baseUrl}). Läuft der Dienst? (${e.message})`;
    return errorResponse("SERVER_ERROR", message, 502);
  }
}
