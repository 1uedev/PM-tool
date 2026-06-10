import { requireAuth } from "./auth-guard.js";
import { requireProjectAccess, requireArtifactAccess } from "./project-access.js";

/**
 * Wraps a project-scoped API handler with the standard guard chain:
 * authentication → project membership/role → optional artifact ownership
 * (tenant isolation).
 *
 * Options:
 *   role          — minimum project role ("VIEWER" | "EDITOR" | "OWNER"), default "VIEWER"
 *   artifact      — if true, resolves params.artifactId, verifies it belongs
 *                   to the project and passes the artifact to the handler
 *   allowArchived — if true, write access is allowed on archived projects
 *                   (needed for un-archiving)
 *
 * The handler receives (request, ctx) with:
 *   ctx.session     — authenticated session (systemRole is DB-fresh)
 *   ctx.params      — already-awaited route params
 *   ctx.membership  — ProjectMember row incl. role
 *   ctx.artifact    — the artifact (only when options.artifact is true)
 *
 * Usage:
 *   export const GET = withProjectRoute({ role: "VIEWER" }, async (request, { session, params }) => { ... });
 */
export function withProjectRoute({ role = "VIEWER", artifact = false, allowArchived = false } = {}, handler) {
  return async (request, routeContext) => {
    const { session, response: authErr } = await requireAuth();
    if (authErr) return authErr;

    const params = await routeContext.params;

    const { membership, response: accessErr } = await requireProjectAccess(
      session.user.id,
      params.projectId,
      role,
      { allowArchived }
    );
    if (accessErr) return accessErr;

    const ctx = { session, params, membership };

    if (artifact) {
      const { artifact: resolved, response: artifactErr } = await requireArtifactAccess(
        params.artifactId,
        params.projectId
      );
      if (artifactErr) return artifactErr;
      ctx.artifact = resolved;
    }

    return handler(request, ctx);
  };
}
