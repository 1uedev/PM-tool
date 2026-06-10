import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import { errorResponse } from "@/lib/errors.js";
import prisma from "@/lib/prisma.js";

/**
 * Retrieves the current session or returns a 401 response.
 * Also verifies the session user against the DB on every request:
 * - user must still exist (stale JWTs after a DB reset)
 * - user must not be INACTIVE (deactivation takes effect immediately,
 *   not only after the JWT expires)
 * - systemRole is taken from the DB, not the token, so role changes
 *   apply without re-login
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      session: null,
      response: errorResponse("AUTH_ERROR", "Not authenticated", 401),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, status: true, systemRole: true },
  });

  if (!user) {
    return {
      session: null,
      response: errorResponse("AUTH_ERROR", "Session expired — please log in again", 401),
    };
  }

  if (user.status === "INACTIVE") {
    return {
      session: null,
      response: errorResponse("AUTH_ERROR", "Dieses Konto wurde deaktiviert", 401),
    };
  }

  // Override the token role with the current DB role
  session.user.systemRole = user.systemRole;

  return { session, response: null };
}

/**
 * Requires the current user to have systemRole ADMIN.
 * Usage: const { session, response } = await requireAdmin(); if (response) return response;
 */
export async function requireAdmin() {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return { session: null, response: authErr };

  if (session.user.systemRole !== "ADMIN") {
    return {
      session: null,
      response: errorResponse("FORBIDDEN", "Nur Admins haben Zugriff auf diesen Bereich", 403),
    };
  }

  return { session, response: null };
}
