import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess, requireArtifactAccess } from "@/lib/middleware/project-access.js";
import { validateBody } from "@/lib/validators/index.js";
import { updateArtifactSchema } from "@/lib/validators/artifact.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { logAction } from "@/lib/audit.js";

function parseArtifact(artifact) {
  return {
    ...artifact,
    fields: typeof artifact.fields === "string"
      ? JSON.parse(artifact.fields)
      : artifact.fields,
  };
}

// GET /api/projects/:id/artifacts/:aid
export async function GET(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId, artifactId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "VIEWER");
  if (accessErr) return accessErr;

  const { artifact, response: artifactErr } = await requireArtifactAccess(artifactId, projectId);
  if (artifactErr) return artifactErr;

  // artifact is already fetched by requireArtifactAccess — return it directly
  return successResponse(parseArtifact(artifact));
}

// PATCH /api/projects/:id/artifacts/:aid — update + auto-version
export async function PATCH(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId, artifactId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "EDITOR");
  if (accessErr) return accessErr;

  const { artifact, response: artifactErr } = await requireArtifactAccess(artifactId, projectId);
  if (artifactErr) return artifactErr;

  const { data, response: validErr } = await validateBody(request, updateArtifactSchema);
  if (validErr) return validErr;

  try {
    const currentFields = typeof artifact.fields === "string"
      ? JSON.parse(artifact.fields)
      : artifact.fields;

    const newFields = data.fields
      ? { ...currentFields, ...data.fields }
      : currentFields;

    const newTitle = data.title ?? artifact.title;
    const newStatus = data.status ?? artifact.status;

    // Get next version number
    const lastVersion = await prisma.artifactVersion.findFirst({
      where: { artifactId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const nextVersion = (lastVersion?.version ?? 0) + 1;

    const updated = await prisma.artifact.update({
      where: { id: artifactId },
      data: {
        title: newTitle,
        status: newStatus,
        fields: JSON.stringify(newFields),
        versions: {
          create: {
            version: nextVersion,
            title: newTitle,
            fields: JSON.stringify(newFields),
            status: newStatus,
            authorId: session.user.id,
          },
        },
      },
    });

    return successResponse(parseArtifact(updated));
  } catch (error) {
    console.error("[PATCH artifact]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}

// DELETE /api/projects/:id/artifacts/:aid — soft delete (sets deleted: true)
export async function DELETE(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId, artifactId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "EDITOR");
  if (accessErr) return accessErr;

  const { artifact, response: artifactErr } = await requireArtifactAccess(artifactId, projectId);
  if (artifactErr) return artifactErr;

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
