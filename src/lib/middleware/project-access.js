import prisma from "@/lib/prisma.js";
import { errorResponse } from "@/lib/errors.js";

// Role hierarchy: higher index = more permissions
const ROLE_LEVELS = { VIEWER: 0, EDITOR: 1, OWNER: 2 };

/**
 * Verifies that the authenticated user is a member of the given project
 * and has at least the required role.
 *
 * Returns { membership, response } — if response is non-null, return it immediately.
 *
 * Usage in API routes:
 *   const { membership, response } = await requireProjectAccess(userId, projectId, "EDITOR");
 *   if (response) return response;
 */
export async function requireProjectAccess(userId, projectId, requiredRole = "VIEWER") {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
    include: { project: { select: { id: true, status: true } } },
  });

  if (!membership) {
    return {
      membership: null,
      response: errorResponse("FORBIDDEN", "Kein Zugriff auf dieses Projekt", 403),
    };
  }

  // Archived projects are read-only — block any write operations
  if (membership.project?.status === "ARCHIVED" && requiredRole !== "VIEWER") {
    return {
      membership: null,
      response: errorResponse("FORBIDDEN", "Dieses Projekt ist archiviert und kann nicht bearbeitet werden", 403),
    };
  }

  const userLevel = ROLE_LEVELS[membership.role] ?? -1;
  const requiredLevel = ROLE_LEVELS[requiredRole] ?? 0;

  if (userLevel < requiredLevel) {
    return {
      membership: null,
      response: errorResponse(
        "FORBIDDEN",
        `Diese Aktion erfordert die Rolle '${requiredRole}'`,
        403
      ),
    };
  }

  return { membership, response: null };
}

/**
 * Checks that an artifact belongs to the given project (tenant isolation).
 * Returns { artifact, response }.
 */
export async function requireArtifactAccess(artifactId, projectId) {
  const artifact = await prisma.artifact.findFirst({
    where: { id: artifactId, projectId, deleted: false },
  });

  if (!artifact) {
    return {
      artifact: null,
      response: errorResponse("NOT_FOUND", "Artefakt nicht gefunden", 404),
    };
  }

  return { artifact, response: null };
}
