import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { logAction } from "@/lib/audit.js";

// POST /api/projects/:id/artifacts/:aid/versions/:vid/restore — restore to this version
export const POST = withProjectRoute({ role: "EDITOR", artifact: true }, async (request, { session, params }) => {
  const { projectId, artifactId, versionId } = params;

  try {
    const version = await prisma.artifactVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.artifactId !== artifactId) {
      return errorResponse("NOT_FOUND", "Version nicht gefunden", 404);
    }

    // Get next version number
    const lastVersion = await prisma.artifactVersion.findFirst({
      where: { artifactId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const nextVersion = (lastVersion?.version ?? 0) + 1;

    // Restore: update artifact + create new version entry
    const updated = await prisma.artifact.update({
      where: { id: artifactId },
      data: {
        title: version.title,
        status: version.status,
        fields: version.fields,
        versions: {
          create: {
            version: nextVersion,
            title: version.title,
            fields: version.fields,
            status: version.status,
            authorId: session.user.id,
          },
        },
      },
    });

    await logAction("ARTIFACT_RESTORE", session.user.id, projectId, artifactId, {
      artifactTitle: version.title,
      artifactType: updated.type,
      restoredFromVersion: version.version,
    });

    return successResponse({
      ...updated,
      fields: typeof updated.fields === "string" ? JSON.parse(updated.fields) : updated.fields,
      restoredFromVersion: version.version,
    });
  } catch (error) {
    console.error("[POST /versions/:id/restore]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
});
