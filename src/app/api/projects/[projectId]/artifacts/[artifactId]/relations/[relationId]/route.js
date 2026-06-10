import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// DELETE /api/projects/:id/artifacts/:aid/relations/:rid
export const DELETE = withProjectRoute({ role: "EDITOR", artifact: true }, async (request, { params }) => {
  const { artifactId, relationId } = params;

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
});
