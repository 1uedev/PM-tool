import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import { errorResponse } from "@/lib/errors.js";
import prisma from "@/lib/prisma.js";

/**
 * Retrieves the current session or returns a 401 response.
 * Also verifies the session user still exists in the DB —
 * catches stale JWTs after a DB reset without exposing a 500.
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      session: null,
      response: errorResponse("AUTH_ERROR", "Not authenticated", 401),
    };
  }

  // Verify the user still exists (guards against stale JWTs after DB migrations)
  const exists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });

  if (!exists) {
    return {
      session: null,
      response: errorResponse("AUTH_ERROR", "Session expired — please log in again", 401),
    };
  }

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
