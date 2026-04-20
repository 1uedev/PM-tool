import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess, requireArtifactAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// DELETE /api/projects/:id/artifacts/:aid/relations/:rid
export async function DELETE(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId, artifactId, relationId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "EDITOR");
  if (accessErr) return accessErr;

  const { response: artifactErr } = await requireArtifactAccess(artifactId, projectId);
  if (artifactErr) return artifactErr;

  try {
    const relation = await prisma.relation.findUnique({ where: { id: relationId } });

    if (!relation || (relation.sourceId !== artifactId && relation.targetId !== artifactId)) {
      return errorResponse("NOT_FOUND", "Verknüpfung nicht gefunden", 404);
    }

    await prisma.relation.delete({ where: { id: relationId } });
    return successResponse({ id: relationId });
  } catch (error) {
    console.error("[DELETE /relations/:id]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
