import { z } from "zod";
import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { validateBody } from "@/lib/validators/index.js";
import { updateArtifactWithVersion } from "@/lib/artifact-versioning.js";
import { ARTIFACT_FIELD_DEFS } from "@/lib/artifactFields.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { logAction } from "@/lib/audit.js";

const applySchema = z.object({
  field: z.string().min(1),
  newValue: z.string().max(4000),
  rationale: z.string().max(600).optional(),
});

// POST /api/projects/:id/artifacts/:aid/chat/apply — apply one AI-chat change
// to a field (or the title), creating an ArtifactVersion tagged source=AI_CHAT.
export const POST = withProjectRoute(
  { role: "EDITOR", artifact: true },
  async (request, { session, params, artifact }) => {
    const { projectId, artifactId } = params;

    const { data, response: validErr } = await validateBody(request, applySchema);
    if (validErr) return validErr;

    const fieldDefs = ARTIFACT_FIELD_DEFS[artifact.type] ?? [];
    const validKeys = new Set([...fieldDefs.map((f) => f.key), "title"]);
    if (!validKeys.has(data.field)) {
      return errorResponse("VALIDATION_ERROR", `Unbekanntes Feld: ${data.field}`, 400);
    }

    try {
      const currentFields =
        typeof artifact.fields === "string" ? JSON.parse(artifact.fields) : artifact.fields;

      let newTitle = artifact.title;
      let newFields = currentFields;
      if (data.field === "title") {
        newTitle = data.newValue.slice(0, 200);
      } else {
        newFields = { ...currentFields, [data.field]: data.newValue };
      }

      const updated = await prisma.$transaction((tx) =>
        updateArtifactWithVersion(tx, artifactId, {
          title: newTitle,
          status: artifact.status,
          fields: JSON.stringify(newFields),
          authorId: session.user.id,
          source: "AI_CHAT",
          note: data.rationale || null,
        })
      );

      await logAction("ARTIFACT_AI_CHAT_EDIT", session.user.id, projectId, artifactId, {
        field: data.field,
        rationale: data.rationale ?? null,
      }).catch(() => {});

      return successResponse({
        ...updated,
        fields: typeof updated.fields === "string" ? JSON.parse(updated.fields) : updated.fields,
      });
    } catch (error) {
      console.error("[POST /chat/apply]", error);
      return errorResponse("SERVER_ERROR", "Änderung konnte nicht angewendet werden", 500);
    }
  }
);
