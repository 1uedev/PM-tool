import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/projects/:id/artifacts — list all non-deleted artifacts
export async function GET(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId } = await params;
  const { response: accessErr } = await requireProjectAccess(
    session.user.id, projectId, "VIEWER"
  );
  if (accessErr) return accessErr;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const artifacts = await prisma.artifact.findMany({
      where: {
        projectId,
        deleted: false,
        ...(type ? { type } : {}),
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(artifacts);
  } catch (error) {
    console.error("[GET /api/projects/:id/artifacts]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
