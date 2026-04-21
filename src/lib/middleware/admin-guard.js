import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import { errorResponse } from "@/lib/errors.js";

/**
 * Verifies that the current request is authenticated and the user has
 * the ADMIN system role. Returns { session, response } — if response is
 * non-null, return it immediately from the API route.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      session: null,
      response: errorResponse("AUTH_ERROR", "Nicht authentifiziert", 401),
    };
  }

  if (session.user.systemRole !== "ADMIN") {
    return {
      session: null,
      response: errorResponse("FORBIDDEN", "Nur Admins dürfen auf diesen Bereich zugreifen", 403),
    };
  }

  return { session, response: null };
}
