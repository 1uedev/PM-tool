import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/templates/:id — full template with artifacts
export async function GET(request, { params }) {
  const { response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { templateId } = await params;

  try {
    const template = await prisma.projectTemplate.findUnique({
      where: { id: templateId },
      include: {
        createdBy: { select: { name: true, email: true } },
        artifacts: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!template) return errorResponse("NOT_FOUND", "Vorlage nicht gefunden", 404);

    return successResponse({
      ...template,
      artifacts: template.artifacts.map((a) => ({
        ...a,
        fields: (() => { try { return JSON.parse(a.fields); } catch { return {}; } })(),
      })),
    });
  } catch (error) {
    console.error("[GET /api/templates/:id]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}

// DELETE /api/templates/:id — creator or admin only
export async function DELETE(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { templateId } = await params;

  try {
    const template = await prisma.projectTemplate.findUnique({
      where: { id: templateId },
      select: { createdById: true },
    });

    if (!template) return errorResponse("NOT_FOUND", "Vorlage nicht gefunden", 404);

    const isAdmin = session.user.systemRole === "ADMIN";
    if (template.createdById !== session.user.id && !isAdmin) {
      return errorResponse("FORBIDDEN", "Keine Berechtigung", 403);
    }

    await prisma.projectTemplate.delete({ where: { id: templateId } });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/templates/:id]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
