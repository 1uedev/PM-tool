import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { logAction } from "@/lib/audit.js";
import { updateArtifactWithVersion } from "@/lib/artifact-versioning.js";

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

    // Restore: update artifact + create new version entry.
    // Transaction makes the version-number increment race-free.
    const updated = await prisma.$transaction((tx) =>
      updateArtifactWithVersion(tx, artifactId, {
        title: version.title,
        status: version.status,
        fields: version.fields,
        authorId: session.user.id,
      })
    );

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
