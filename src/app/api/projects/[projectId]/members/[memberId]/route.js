import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { validateBody } from "@/lib/validators/index.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["VIEWER", "EDITOR", "OWNER"]),
});

// PATCH /api/projects/:id/members/:memberId — change role (OWNER only)
export const PATCH = withProjectRoute(
  { role: "OWNER" },
  async (request, { session, params }) => {
    const { projectId, memberId } = params;

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
);

// DELETE /api/projects/:id/members/:memberId — remove member (OWNER only)
export const DELETE = withProjectRoute(
  { role: "OWNER" },
  async (request, { params }) => {
    const { projectId, memberId } = params;

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
);
