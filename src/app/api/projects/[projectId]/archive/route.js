import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { logAction } from "@/lib/audit.js";

// PATCH /api/projects/:id/archive — toggle archive status (OWNER only)
export async function PATCH(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId } = await params;
  const { response: accessErr } = await requireProjectAccess(
    session.user.id, projectId, "OWNER"
  );
  if (accessErr) return accessErr;

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
