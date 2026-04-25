import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { readEnvLocal, writeEnvLocal, detectDbType, parseDatabaseUrl } from "@/lib/env-config.js";

function requireAdmin(session) {
  if (session.user.systemRole !== "ADMIN") {
    return errorResponse("FORBIDDEN", "Nur Administratoren haben Zugriff", 403);
  }
  return null;
}

// GET /api/admin/database — return current DB config (password masked)
export async function GET() {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;
  const adminErr = requireAdmin(session);
  if (adminErr) return adminErr;

  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const parsed = parseDatabaseUrl(url);

  // Mask password in response
  if (parsed.password) parsed.password = "••••••••";

  return successResponse({
    currentUrl: url.replace(/:([^:@]+)@/, ":••••••••@"), // mask inline too
    ...parsed,
  });
}

// PATCH /api/admin/database — save new DATABASE_URL to .env.local
export async function PATCH(request) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;
  const adminErr = requireAdmin(session);
  if (adminErr) return adminErr;

  const { url } = await request.json();
  if (!url) return errorResponse("VALIDATION_ERROR", "url ist erforderlich", 400);

  const type = detectDbType(url);

  try {
    writeEnvLocal({ DATABASE_URL: url });
  } catch (e) {
    return errorResponse("SERVER_ERROR", `Konnte .env.local nicht schreiben: ${e.message}`, 500);
  }

  return successResponse({ saved: true, type });
}
