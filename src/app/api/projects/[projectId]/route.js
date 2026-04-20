import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { validateBody } from "@/lib/validators/index.js";
import { updateProjectSchema } from "@/lib/validators/project.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/projects/:id
export async function GET(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId } = await params;
  const { membership, response: accessErr } = await requireProjectAccess(
    session.user.id, projectId, "VIEWER"
  );
  if (accessErr) return accessErr;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { artifacts: { where: { deleted: false } } } },
      },
    });

    if (!project) return errorResponse("NOT_FOUND", "Projekt nicht gefunden", 404);

    return successResponse({ ...project, role: membership.role });
  } catch (error) {
    console.error("[GET /api/projects/:id]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}

// PATCH /api/projects/:id — edit name/description (EDITOR+)
export async function PATCH(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId } = await params;
  const { response: accessErr } = await requireProjectAccess(
    session.user.id, projectId, "EDITOR"
  );
  if (accessErr) return accessErr;

  const { data, response: validErr } = await validateBody(request, updateProjectSchema);
  if (validErr) return validErr;

  try {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    return successResponse(project);
  } catch (error) {
    console.error("[PATCH /api/projects/:id]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}

// DELETE /api/projects/:id — only OWNER can delete
export async function DELETE(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId } = await params;
  const { response: accessErr } = await requireProjectAccess(
    session.user.id, projectId, "OWNER"
  );
  if (accessErr) return accessErr;

  try {
    await prisma.project.delete({ where: { id: projectId } });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/projects/:id]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
