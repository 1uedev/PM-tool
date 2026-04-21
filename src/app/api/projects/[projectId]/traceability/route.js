import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/projects/:id/traceability — all artifacts + all relations for traceability view
export async function GET(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "VIEWER");
  if (accessErr) return accessErr;

  try {
    // Load artifacts first, then filter relations to only those within this project
    const artifacts = await prisma.artifact.findMany({
      where: { projectId, deleted: false },
      select: { id: true, type: true, title: true, status: true },
      orderBy: { title: "asc" },
    });

    const artifactIds = artifacts.map((a) => a.id);

    const relations = artifactIds.length > 0
      ? await prisma.relation.findMany({
          where: { sourceId: { in: artifactIds } },
          select: { id: true, type: true, sourceId: true, targetId: true },
        })
      : [];

    return successResponse({ artifacts, relations });
  } catch (error) {
    console.error("[GET /traceability]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
