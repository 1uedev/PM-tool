import { z } from "zod";
import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { validateBody } from "@/lib/validators/index.js";
import { getAiConfig, getAiProvider, isAiAvailable } from "@/lib/ai/provider-factory.js";
import { buildPrompt, hasPromptBuilder } from "@/lib/ai/prompts/index.js";
import { ARTIFACT_CONTEXT_INCLUDE, buildRelatedContext } from "@/lib/ai/artifact-context.js";
import { buildChatSystemPrompt, parseChatResult, CHAT_RESULT_SCHEMA } from "@/lib/ai/chat.js";
import { ARTIFACT_FIELD_DEFS } from "@/lib/artifactFields.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { consumeRateLimit } from "@/lib/rate-limit.js";

// Caps AI spend per user: 60 chat turns per hour
const CHAT_RATE_LIMIT = { limit: 60, windowMs: 60 * 60 * 1000 };

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(40),
});

// POST /api/projects/:id/artifacts/:aid/chat — discuss an AI-generated artifact.
// VIEWER may chat (read-only); applying a change is editor-gated (apply route).
export const POST = withProjectRoute(
  { role: "VIEWER", artifact: true },
  async (request, { session, params }) => {
    const { projectId, artifactId } = params;

    const rate = consumeRateLimit(`ai-chat:${session.user.id}`, CHAT_RATE_LIMIT);
    if (!rate.ok) {
      return errorResponse(
        "RATE_LIMITED",
        "KI-Chat-Limit erreicht (60 Nachrichten pro Stunde) — bitte später erneut versuchen",
        429,
        { retryAfterSec: rate.retryAfterSec }
      );
    }

    const aiConfig = await getAiConfig();
    if (!isAiAvailable(aiConfig)) {
      return errorResponse("SERVER_ERROR", "Kein KI-Provider konfiguriert", 503);
    }

    const { data, response: validErr } = await validateBody(request, chatSchema);
    if (validErr) return validErr;

    // Load artifact with related artifacts for context
    const artifact = await prisma.artifact.findUnique({
      where: { id: artifactId },
      include: ARTIFACT_CONTEXT_INCLUDE,
    });
    if (!artifact) return errorResponse("NOT_FOUND", "Artefakt nicht gefunden", 404);

    const parsedFields =
      typeof artifact.fields === "string" ? JSON.parse(artifact.fields) : artifact.fields;
    const fieldDefs = ARTIFACT_FIELD_DEFS[artifact.type] ?? [];
    const validFieldKeys = fieldDefs.map((f) => f.key);
    const context = buildRelatedContext(artifact);

    // User language preference (prompts default to German)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredLanguage: true },
    });
    const language = user?.preferredLanguage || "de";

    // Reconstruct the original generation prompt where a builder exists
    const originalPrompt = hasPromptBuilder(artifact.type)
      ? buildPrompt(artifact.type, parsedFields, context, language)
      : "";

    // Provenance: earliest logged AI session for this artifact (suggest creates one)
    const firstSession = await prisma.aiSession.findFirst({
      where: { artifactId },
      orderBy: { createdAt: "asc" },
      select: { mode: true },
    });

    const systemPrompt = buildChatSystemPrompt({
      artifact: { type: artifact.type, title: artifact.title, fields: parsedFields },
      fieldDefs,
      originalPrompt,
      context,
      origin: firstSession?.mode ?? null,
      language,
    });

    const messages = [
      { role: "system", content: systemPrompt },
      ...data.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const provider = getAiProvider(aiConfig);
    const startMs = Date.now();
    let raw;
    let usage;
    try {
      const res = await provider.chat(messages, CHAT_RESULT_SCHEMA);
      raw = res.json;
      usage = res.usage;
    } catch (error) {
      console.error("[POST /chat]", error);
      return errorResponse("SERVER_ERROR", "KI-Anfrage fehlgeschlagen — bitte erneut versuchen", 500);
    }

    const durationMs = Date.now() - startMs;
    const { reply, proposal } = parseChatResult(raw, validFieldKeys);

    await prisma.aiSession
      .create({
        data: {
          provider: aiConfig.provider,
          mode: "chat",
          prompt: `${artifact.type}/${artifactId}`,
          response: JSON.stringify({ reply, proposal }),
          artifactId,
          projectId,
          userId: session.user.id,
          durationMs,
          inputTokens: usage?.inputTokens ?? null,
          outputTokens: usage?.outputTokens ?? null,
        },
      })
      .catch(() => {});

    return successResponse({ reply, proposal, durationMs });
  }
);
