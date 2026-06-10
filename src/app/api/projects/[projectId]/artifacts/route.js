import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { validateBody } from "@/lib/validators/index.js";
import { createArtifactSchema } from "@/lib/validators/artifact.js";
import { getDefaultFields } from "@/lib/artifactFields.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/projects/:id/artifacts — list all non-deleted artifacts
export const GET = withProjectRoute({ role: "VIEWER" }, async (request, { params }) => {
  const { projectId } = params;

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
});

// POST /api/projects/:id/artifacts — create artifact + initial version
export const POST = withProjectRoute({ role: "EDITOR" }, async (request, { session, params }) => {
  const { projectId } = params;

  const { data, response: validErr } = await validateBody(request, createArtifactSchema);
  if (validErr) return validErr;

  try {
    // Merge provided fields with type defaults so all keys are present
    const mergedFields = { ...getDefaultFields(data.type), ...data.fields };

    const artifact = await prisma.artifact.create({
      data: {
        type: data.type,
        title: data.title,
        status: data.status,
        fields: JSON.stringify(mergedFields),
        projectId,
        versions: {
          create: {
            version: 1,
            title: data.title,
            fields: JSON.stringify(mergedFields),
            status: data.status,
            authorId: session.user.id,
          },
        },
      },
    });

    return successResponse({ ...artifact, fields: mergedFields }, 201);
  } catch (error) {
    console.error("[POST /api/projects/:id/artifacts]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
});
