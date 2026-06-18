import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { getAiConfig, getAiProvider, isAiAvailable } from "@/lib/ai/provider-factory.js";
import { hasPromptBuilder } from "@/lib/ai/prompts/index.js";
import { ARTIFACT_CONTEXT_INCLUDE, buildRelatedContext } from "@/lib/ai/artifact-context.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { consumeRateLimit } from "@/lib/rate-limit.js";

// Caps AI spend per user: 30 suggestion requests per hour
const AI_RATE_LIMIT = { limit: 30, windowMs: 60 * 60 * 1000 };

// POST /api/projects/:id/artifacts/:aid/ai — request AI suggestions
export const POST = withProjectRoute(
  { role: "EDITOR", artifact: true },
  async (request, { session, params }) => {
    const { artifactId } = params;

    const rate = consumeRateLimit(`ai-suggest:${session.user.id}`, AI_RATE_LIMIT);
    if (!rate.ok) {
      return errorResponse(
        "RATE_LIMITED",
        "KI-Limit erreicht (30 Anfragen pro Stunde) — bitte später erneut versuchen",
        429,
        { retryAfterSec: rate.retryAfterSec }
      );
    }

    const aiConfig = await getAiConfig();
    if (!isAiAvailable(aiConfig)) {
      return errorResponse("SERVER_ERROR", "Kein KI-Provider konfiguriert", 503);
    }

    // Early type check — gives a clear 400 instead of a cryptic 500 for unsupported types
    const artifactForTypeCheck = await prisma.artifact.findUnique({
      where: { id: artifactId },
      select: { type: true },
    });
    if (artifactForTypeCheck && !hasPromptBuilder(artifactForTypeCheck.type)) {
      return errorResponse(
        "VALIDATION_ERROR",
        `KI-Vorschläge werden für den Typ "${artifactForTypeCheck.type}" noch nicht unterstützt`,
        400
      );
    }

    // Load artifact with related artifacts as context
    const artifact = await prisma.artifact.findUnique({
      where: { id: artifactId },
      include: ARTIFACT_CONTEXT_INCLUDE,
    });

    if (!artifact) {
      return errorResponse("NOT_FOUND", "Artefakt nicht gefunden", 404);
    }

    const context = buildRelatedContext(artifact);

    const parsedFields = typeof artifact.fields === "string"
      ? JSON.parse(artifact.fields)
      : artifact.fields;

    // Suggestions follow the user's language preference (templates default to German)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredLanguage: true },
    });
    const language = user?.preferredLanguage || "de";

    const provider = getAiProvider(aiConfig);
    const startMs = Date.now();
    let result;

    try {
      result = await provider.suggest(
        { type: artifact.type, fields: parsedFields, language },
        context
      );
    } catch (error) {
      console.error("[POST /ai]", error);
      await prisma.aiSession.create({
        data: {
          provider: aiConfig.provider,
          mode: "suggest",
          prompt: "",
          response: error.message ?? "error",
          artifactId,
          projectId: params.projectId,
          userId: session.user.id,
          durationMs: Date.now() - startMs,
        },
      }).catch(() => {});
      return errorResponse("SERVER_ERROR", "KI-Anfrage fehlgeschlagen — bitte erneut versuchen", 500);
    }

    const durationMs = Date.now() - startMs;
    const { usage, ...suggestions } = result;

    await prisma.aiSession.create({
      data: {
        provider: aiConfig.provider,
        mode: "suggest",
        prompt: `${artifact.type}/${artifactId}`,
        response: JSON.stringify(suggestions),
        artifactId,
        projectId: params.projectId,
        userId: session.user.id,
        durationMs,
        inputTokens: usage?.inputTokens ?? null,
        outputTokens: usage?.outputTokens ?? null,
      },
    }).catch(() => {});

    return successResponse({ ...suggestions, durationMs });
  }
);
