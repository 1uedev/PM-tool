import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { validateBody } from "@/lib/validators/index.js";
import { createCommentSchema } from "@/lib/validators/comment.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { createCommentNotifications } from "@/lib/notifications.js";

// GET /api/projects/:id/artifacts/:aid/comments — list comments
export const GET = withProjectRoute({ role: "VIEWER", artifact: true }, async (request, { params }) => {
  const { artifactId } = params;

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
});

// POST /api/projects/:id/artifacts/:aid/comments — add comment
// VIEWER may comment by design — commenting is not an artifact edit.
export const POST = withProjectRoute({ role: "VIEWER", artifact: true }, async (request, { session, params, artifact }) => {
  const { projectId, artifactId } = params;

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

    createCommentNotifications({
      actorId: session.user.id,
      projectId,
      artifactId,
      artifactTitle: artifact.title,
      contentPreview: data.content,
    });

    return successResponse(comment, 201);
  } catch (error) {
    console.error("[POST /comments]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
});
