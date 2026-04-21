import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { validateBody } from "@/lib/validators/index.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["VIEWER", "EDITOR", "OWNER"]),
});

// PATCH /api/projects/:id/members/:memberId — change role (OWNER only)
export async function PATCH(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId, memberId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "OWNER");
  if (accessErr) return accessErr;

  const { data, response: validErr } = await validateBody(request, updateRoleSchema);
  if (validErr) return validErr;

  try {
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
      include: { user: { select: { id: true } } },
    });

    if (!member || member.projectId !== projectId) {
      return errorResponse("NOT_FOUND", "Mitglied nicht gefunden", 404);
    }

    // Prevent owner from demoting themselves if they're the only owner
    if (member.user.id === session.user.id && data.role !== "OWNER") {
      const ownerCount = await prisma.projectMember.count({
        where: { projectId, role: "OWNER" },
      });
      if (ownerCount <= 1) {
        return errorResponse("VALIDATION_ERROR", "Du kannst dich nicht selbst entfernen — es muss mindestens einen Owner geben", 400);
      }
    }

    const updated = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role: data.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return successResponse({
      id: updated.id,
      role: updated.role,
      createdAt: updated.createdAt,
      user: updated.user,
      isCurrentUser: updated.user.id === session.user.id,
    });
  } catch (error) {
    console.error("[PATCH /members/:id]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}

// DELETE /api/projects/:id/members/:memberId — remove member (OWNER only)
export async function DELETE(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId, memberId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "OWNER");
  if (accessErr) return accessErr;

  try {
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
      include: { user: { select: { id: true } } },
    });

    if (!member || member.projectId !== projectId) {
      return errorResponse("NOT_FOUND", "Mitglied nicht gefunden", 404);
    }

    // Prevent removing the last owner
    if (member.role === "OWNER") {
      const ownerCount = await prisma.projectMember.count({
        where: { projectId, role: "OWNER" },
      });
      if (ownerCount <= 1) {
        return errorResponse("VALIDATION_ERROR", "Der letzte Owner kann nicht entfernt werden", 400);
      }
    }

    await prisma.projectMember.delete({ where: { id: memberId } });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("[DELETE /members/:id]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
