import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import { errorResponse } from "@/lib/errors.js";

/**
 * Retrieves the current session or returns a 401 response.
 * Usage in API routes:
 *   const { session, response } = await requireAuth();
 *   if (response) return response;
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      session: null,
      response: errorResponse("AUTH_ERROR", "Nicht authentifiziert", 401),
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
