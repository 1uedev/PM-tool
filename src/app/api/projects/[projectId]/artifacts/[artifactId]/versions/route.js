import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess, requireArtifactAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/projects/:id/artifacts/:aid/versions — list all versions (newest first)
export async function GET(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId, artifactId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "VIEWER");
  if (accessErr) return accessErr;

  const { response: artifactErr } = await requireArtifactAccess(artifactId, projectId);
  if (artifactErr) return artifactErr;

  try {
    const versions = await prisma.artifactVersion.findMany({
      where: { artifactId },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { version: "desc" },
    });

    return successResponse(versions.map((v) => ({
      ...v,
      fields: typeof v.fields === "string" ? JSON.parse(v.fields) : v.fields,
    })));
  } catch (error) {
    console.error("[GET /versions]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
