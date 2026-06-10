import { requireAdmin } from "@/lib/middleware/auth-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { writeEnvLocal, parseDatabaseUrl, validateDatabaseUrl } from "@/lib/env-config.js";

// GET /api/admin/database — return current DB config (password masked)
export async function GET() {
  const { response: authErr } = await requireAdmin();
  if (authErr) return authErr;

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
  const { response: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const { url } = await request.json();
  if (!url) return errorResponse("VALIDATION_ERROR", "url ist erforderlich", 400);

  // Strict validation — also blocks .env.local injection via quotes/newlines
  const validation = validateDatabaseUrl(url);
  if (!validation.ok) {
    return errorResponse("VALIDATION_ERROR", validation.message, 400);
  }

  try {
    writeEnvLocal({ DATABASE_URL: url });
  } catch (e) {
    return errorResponse("SERVER_ERROR", `Konnte .env.local nicht schreiben: ${e.message}`, 500);
  }

  return successResponse({ saved: true, type: validation.type });
}
