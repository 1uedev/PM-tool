import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/projects/:id/artifacts/:aid/versions — list all versions (newest first)
export const GET = withProjectRoute({ role: "VIEWER", artifact: true }, async (request, { params }) => {
  const { artifactId } = params;

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
});
