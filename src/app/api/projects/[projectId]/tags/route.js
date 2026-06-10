import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { validateBody } from "@/lib/validators/index.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { z } from "zod";

const createTagSchema = z.object({
  name: z.string().min(1).max(50).trim(),
});

// GET /api/projects/:id/tags — list all tags for project
export const GET = withProjectRoute({ role: "VIEWER" }, async (request, { params }) => {
  const { projectId } = params;

  try {
    const tags = await prisma.tag.findMany({
      where: { projectId },
      orderBy: { name: "asc" },
      include: { _count: { select: { artifacts: true } } },
    });
    return successResponse(tags.map((t) => ({ id: t.id, name: t.name, count: t._count.artifacts })));
  } catch (error) {
    console.error("[GET /tags]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
});

// POST /api/projects/:id/tags — create tag (EDITOR+)
export const POST = withProjectRoute({ role: "EDITOR" }, async (request, { params }) => {
  const { projectId } = params;

  const { data, response: validErr } = await validateBody(request, createTagSchema);
  if (validErr) return validErr;

  try {
    const tag = await prisma.tag.upsert({
      where: { name_projectId: { name: data.name, projectId } },
      create: { name: data.name, projectId },
      update: {},
    });
    return successResponse(tag, 201);
  } catch (error) {
    console.error("[POST /tags]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
});
