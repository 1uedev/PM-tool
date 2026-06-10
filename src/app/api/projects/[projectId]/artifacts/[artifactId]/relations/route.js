import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { requireArtifactAccess } from "@/lib/middleware/project-access.js";
import { validateBody } from "@/lib/validators/index.js";
import { createRelationSchema } from "@/lib/validators/relation.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/projects/:id/artifacts/:aid/relations — list relations for artifact
export const GET = withProjectRoute(
  { role: "VIEWER", artifact: true },
  async (request, { params }) => {
    const { artifactId } = params;

    try {
      const [relationsFrom, relationsTo] = await Promise.all([
        prisma.relation.findMany({
          where: { sourceId: artifactId },
          include: {
            target: { select: { id: true, type: true, title: true, status: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.relation.findMany({
          where: { targetId: artifactId },
          include: {
            source: { select: { id: true, type: true, title: true, status: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return successResponse({ relationsFrom, relationsTo });
    } catch (error) {
      console.error("[GET /relations]", error);
      return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
    }
  }
);

// POST /api/projects/:id/artifacts/:aid/relations — create relation
export const POST = withProjectRoute(
  { role: "EDITOR", artifact: true },
  async (request, { params }) => {
    const { projectId, artifactId } = params;

    const { data, response: validErr } = await validateBody(request, createRelationSchema);
    if (validErr) return validErr;

    if (data.targetId === artifactId) {
      return errorResponse("VALIDATION_ERROR", "Ein Artefakt kann nicht mit sich selbst verknüpft werden", 400);
    }

    // Ensure target belongs to the same project and is not deleted
    const { response: targetErr } = await requireArtifactAccess(data.targetId, projectId);
    if (targetErr) return errorResponse("NOT_FOUND", "Ziel-Artefakt nicht gefunden", 404);

    try {
      const relation = await prisma.relation.create({
        data: {
          type: data.type,
          sourceId: artifactId,
          targetId: data.targetId,
        },
        include: {
          target: { select: { id: true, type: true, title: true, status: true } },
        },
      });

      return successResponse(relation, 201);
    } catch (error) {
      // Unique constraint: relation already exists
      if (error.code === "P2002") {
        return errorResponse("VALIDATION_ERROR", "Diese Verknüpfung existiert bereits", 409);
      }
      console.error("[POST /relations]", error);
      return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
    }
  }
);
