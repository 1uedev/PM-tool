import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess, requireArtifactAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { logAction } from "@/lib/audit.js";

// POST /api/projects/:id/artifacts/:aid/versions/:vid/restore — restore to this version
export async function POST(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId, artifactId, versionId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "EDITOR");
  if (accessErr) return accessErr;

  const { response: artifactErr } = await requireArtifactAccess(artifactId, projectId);
  if (artifactErr) return artifactErr;

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
}
