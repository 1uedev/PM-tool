import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/projects/:id/graph — all artifacts + relations for graph visualization
export const GET = withProjectRoute({ role: "VIEWER" }, async (request, { params }) => {
  const { projectId } = params;

  try {
    const artifacts = await prisma.artifact.findMany({
      where: { projectId, deleted: false },
      select: { id: true, type: true, title: true, status: true },
      orderBy: { createdAt: "asc" },
    });

    // Two-step to avoid SQLite nested-OR issues
    const artifactIds = artifacts.map((a) => a.id);
    const relations = await prisma.relation.findMany({
      where: { sourceId: { in: artifactIds } },
      select: { id: true, type: true, sourceId: true, targetId: true },
    });

    return successResponse({ artifacts, relations });
  } catch (error) {
    console.error("[GET /graph]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
});
