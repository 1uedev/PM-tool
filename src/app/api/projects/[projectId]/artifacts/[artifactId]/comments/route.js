import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess, requireArtifactAccess } from "@/lib/middleware/project-access.js";
import { validateBody } from "@/lib/validators/index.js";
import { createCommentSchema } from "@/lib/validators/comment.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/projects/:id/artifacts/:aid/comments — list comments
export async function GET(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId, artifactId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "VIEWER");
  if (accessErr) return accessErr;

  const { response: artifactErr } = await requireArtifactAccess(artifactId, projectId);
  if (artifactErr) return artifactErr;

  try {
    const comments = await prisma.comment.findMany({
      where: { artifactId },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return successResponse(comments);
  } catch (error) {
    console.error("[GET /comments]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}

// POST /api/projects/:id/artifacts/:aid/comments — add comment
export async function POST(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId, artifactId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "VIEWER");
  if (accessErr) return accessErr;

  const { response: artifactErr } = await requireArtifactAccess(artifactId, projectId);
  if (artifactErr) return artifactErr;

  const { data, response: validErr } = await validateBody(request, createCommentSchema);
  if (validErr) return validErr;

  try {
    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        authorId: session.user.id,
        artifactId,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return successResponse(comment, 201);
  } catch (error) {
    console.error("[POST /comments]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
