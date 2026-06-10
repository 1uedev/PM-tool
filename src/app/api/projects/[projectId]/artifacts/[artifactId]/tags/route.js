import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { validateBody } from "@/lib/validators/index.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { z } from "zod";

const addTagSchema = z.object({ tagId: z.string().min(1) });

// GET /api/projects/:id/artifacts/:aid/tags — tags on this artifact
export const GET = withProjectRoute({ role: "VIEWER", artifact: true }, async (request, { params }) => {
  const { artifactId } = params;

  try {
    const artifact = await prisma.artifact.findUnique({
      where: { id: artifactId },
      include: { tags: { include: { tag: true } } },
    });
    const tags = (artifact?.tags ?? []).map((at) => ({ id: at.tag.id, name: at.tag.name }));
    return successResponse(tags);
  } catch (error) {
    console.error("[GET /artifact/tags]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
});

// POST /api/projects/:id/artifacts/:aid/tags — assign tag (EDITOR+)
export const POST = withProjectRoute({ role: "EDITOR", artifact: true }, async (request, { params }) => {
  const { projectId, artifactId } = params;

  const { data, response: validErr } = await validateBody(request, addTagSchema);
  if (validErr) return validErr;

  try {
    // Verify tag belongs to this project
    const tag = await prisma.tag.findFirst({ where: { id: data.tagId, projectId } });
    if (!tag) return errorResponse("NOT_FOUND", "Tag nicht gefunden", 404);

    await prisma.artifactTag.upsert({
      where: { artifactId_tagId: { artifactId, tagId: data.tagId } },
      create: { artifactId, tagId: data.tagId },
      update: {},
    });
    return successResponse({ id: tag.id, name: tag.name }, 201);
  } catch (error) {
    console.error("[POST /artifact/tags]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
});

// DELETE /api/projects/:id/artifacts/:aid/tags?tagId=... — remove tag (EDITOR+)
export const DELETE = withProjectRoute({ role: "EDITOR", artifact: true }, async (request, { params }) => {
  const { artifactId } = params;

  const { searchParams } = new URL(request.url);
  const tagId = searchParams.get("tagId");
  if (!tagId) return errorResponse("VALIDATION_ERROR", "tagId fehlt", 400);

  try {
    await prisma.artifactTag.deleteMany({ where: { artifactId, tagId } });
    return successResponse({ ok: true });
  } catch (error) {
    console.error("[DELETE /artifact/tags]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
});
