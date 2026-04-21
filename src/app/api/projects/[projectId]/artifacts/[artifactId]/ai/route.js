import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess, requireArtifactAccess } from "@/lib/middleware/project-access.js";
import { getAiProvider, isAiAvailable } from "@/lib/ai/provider-factory.js";
import { hasPromptBuilder } from "@/lib/ai/prompts/index.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// POST /api/projects/:id/artifacts/:aid/ai — request AI suggestions
export async function POST(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId, artifactId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "EDITOR");
  if (accessErr) return accessErr;

  const { response: artifactErr } = await requireArtifactAccess(artifactId, projectId);
  if (artifactErr) return artifactErr;

  if (!isAiAvailable()) {
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
    include: {
      relationsFrom: {
        include: { target: { select: { type: true, title: true, fields: true } } },
      },
      relationsTo: {
        include: { source: { select: { type: true, title: true, fields: true } } },
      },
    },
  });

  if (!artifact) {
    return errorResponse("NOT_FOUND", "Artefakt nicht gefunden", 404);
  }

  // Build context string from related artifacts
  const relatedArtifacts = [
    ...artifact.relationsFrom.map((r) => r.target),
    ...artifact.relationsTo.map((r) => r.source),
  ];
  const context = relatedArtifacts.length > 0
    ? relatedArtifacts.map((a) => {
        const fields = typeof a.fields === "string" ? JSON.parse(a.fields) : a.fields;
        return `[${a.type}] ${a.title}: ${Object.values(fields).filter(Boolean).join(" | ")}`;
      }).join("\n")
    : "";

  const parsedFields = typeof artifact.fields === "string"
    ? JSON.parse(artifact.fields)
    : artifact.fields;

  const provider = getAiProvider();
  const startMs = Date.now();
  let result;

  try {
    result = await provider.suggest(
      { type: artifact.type, fields: parsedFields },
      context
    );
  } catch (error) {
    console.error("[POST /ai]", error);
    // Log failed session
    await prisma.aiSession.create({
      data: {
        provider: process.env.AI_PROVIDER ?? "claude",
        mode: "suggest",
        prompt: "",
        response: error.message ?? "error",
        artifactId,
        userId: session.user.id,
        durationMs: Date.now() - startMs,
      },
    }).catch(() => {}); // non-blocking
    return errorResponse("SERVER_ERROR", "KI-Anfrage fehlgeschlagen — bitte erneut versuchen", 500);
  }

  const durationMs = Date.now() - startMs;

  // Log successful session (F4)
  await prisma.aiSession.create({
    data: {
      provider: process.env.AI_PROVIDER ?? "claude",
      mode: "suggest",
      prompt: `${artifact.type}/${artifactId}`,
      response: JSON.stringify(result),
      artifactId,
      userId: session.user.id,
      durationMs,
    },
  }).catch(() => {}); // non-blocking, don't fail the request

  return successResponse({ ...result, durationMs });
}
