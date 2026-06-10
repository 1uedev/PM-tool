import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { logAction } from "@/lib/audit.js";

// PATCH /api/projects/:id/archive — toggle archive status (OWNER only)
// allowArchived: un-archiving requires write access to an archived project
export const PATCH = withProjectRoute(
  { role: "OWNER", allowArchived: true },
  async (request, { session, params }) => {
    const { projectId } = params;

    try {
      const current = await prisma.project.findUnique({
        where: { id: projectId },
        select: { status: true, name: true },
      });

      if (!current) return errorResponse("NOT_FOUND", "Projekt nicht gefunden", 404);

      const newStatus = current.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";

      const project = await prisma.project.update({
        where: { id: projectId },
        data: { status: newStatus },
      });

      const action = newStatus === "ARCHIVED" ? "PROJECT_ARCHIVE" : "PROJECT_UNARCHIVE";
      await logAction(action, session.user.id, projectId, projectId, {
        projectName: current.name,
      });

      return successResponse(project);
    } catch (error) {
      console.error("[PATCH /api/projects/:id/archive]", error);
      return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
    }
  }
);
