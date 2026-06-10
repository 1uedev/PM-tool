import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { validateBody } from "@/lib/validators/index.js";
import { updateArtifactSchema } from "@/lib/validators/artifact.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { logAction } from "@/lib/audit.js";
import { getDefaultFields } from "@/lib/artifactFields.js";
import { updateArtifactWithVersion } from "@/lib/artifact-versioning.js";

function parseArtifact(artifact) {
  return {
    ...artifact,
    fields: typeof artifact.fields === "string"
      ? JSON.parse(artifact.fields)
      : artifact.fields,
  };
}

// GET /api/projects/:id/artifacts/:aid
export const GET = withProjectRoute(
  { role: "VIEWER", artifact: true },
  async (request, { artifact }) => {
    // artifact is already fetched by the guard chain — return it directly
    return successResponse(parseArtifact(artifact));
  }
);

// PATCH /api/projects/:id/artifacts/:aid — update + auto-version
export const PATCH = withProjectRoute(
  { role: "EDITOR", artifact: true },
  async (request, { session, params, artifact }) => {
    const { artifactId } = params;

    const { data, response: validErr } = await validateBody(request, updateArtifactSchema);
    if (validErr) return validErr;

    try {
      const currentFields = typeof artifact.fields === "string"
        ? JSON.parse(artifact.fields)
        : artifact.fields;

      // Merge only keys that belong to this artifact type — discard unknown keys
      const allowedKeys = new Set(Object.keys(getDefaultFields(artifact.type)));
      const incomingFields = data.fields
        ? Object.fromEntries(
            Object.entries(data.fields).filter(([k]) => allowedKeys.has(k))
          )
        : {};
      const newFields = data.fields
        ? { ...currentFields, ...incomingFields }
        : currentFields;

      const newTitle = data.title ?? artifact.title;
      const newStatus = data.status ?? artifact.status;

      // Transaction makes the version-number increment race-free
      const updated = await prisma.$transaction((tx) =>
        updateArtifactWithVersion(tx, artifactId, {
          title: newTitle,
          status: newStatus,
          fields: JSON.stringify(newFields),
          authorId: session.user.id,
        })
      );

      return successResponse(parseArtifact(updated));
    } catch (error) {
      console.error("[PATCH artifact]", error);
      return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
    }
  }
);

// DELETE /api/projects/:id/artifacts/:aid — soft delete (sets deleted: true)
export const DELETE = withProjectRoute(
  { role: "EDITOR", artifact: true },
  async (request, { session, params, artifact }) => {
    const { projectId, artifactId } = params;

    try {
      await prisma.artifact.update({
        where: { id: artifactId },
        data: { deleted: true },
      });

      await logAction("ARTIFACT_DELETE", session.user.id, projectId, artifactId, {
        artifactTitle: artifact.title,
        artifactType: artifact.type,
      });

      return successResponse({ deleted: true });
    } catch (error) {
      console.error("[DELETE artifact]", error);
      return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
    }
  }
);
