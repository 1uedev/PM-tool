import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import prisma from "@/lib/prisma.js";

const MAX_BULK_IDS = 200;

// POST /api/projects/:id/artifacts/bulk/tags — assign tags to multiple artifacts
// Body: { ids: string[], tagIds: string[] }
export async function POST(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "EDITOR");
  if (accessErr) return accessErr;

  let body;
  try { body = await request.json(); } catch {
    return errorResponse("VALIDATION_ERROR", "Ungültiger JSON-Body", 400);
  }

  const { ids, tagIds } = body;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_BULK_IDS) {
    return errorResponse("VALIDATION_ERROR", `ids muss ein Array mit 1–${MAX_BULK_IDS} Einträgen sein`, 400);
  }
  if (!Array.isArray(tagIds) || tagIds.length === 0) {
    return errorResponse("VALIDATION_ERROR", "tagIds muss ein nicht-leeres Array sein", 400);
  }

  try {
    // Verify all artifacts belong to this project and are not deleted
    const artifacts = await prisma.artifact.findMany({
      where: { id: { in: ids }, projectId, deleted: false },
      select: { id: true },
    });
    const validIds = new Set(artifacts.map((a) => a.id));

    // Verify all tags belong to this project
    const tags = await prisma.tag.findMany({
      where: { id: { in: tagIds }, projectId },
      select: { id: true },
    });
    const validTagIds = tags.map((t) => t.id);

    if (validTagIds.length === 0) {
      return errorResponse("VALIDATION_ERROR", "Keine gültigen Tags gefunden", 400);
    }

    // Upsert ArtifactTag rows for each (artifactId, tagId) pair
    const pairs = [];
    for (const artifactId of validIds) {
      for (const tagId of validTagIds) {
        pairs.push({ artifactId, tagId });
      }
    }

    await prisma.$transaction(
      pairs.map((p) =>
        prisma.artifactTag.upsert({
          where: { artifactId_tagId: p },
          create: p,
          update: {},
        })
      )
    );

    return successResponse({ assigned: pairs.length });
  } catch (error) {
    console.error("[POST bulk/tags]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
