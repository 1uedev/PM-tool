import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

function requireAdmin(session) {
  if (session.user.systemRole !== "ADMIN") {
    return errorResponse("FORBIDDEN", "Nur Administratoren haben Zugriff", 403);
  }
  return null;
}

// GET /api/admin/languages — list all languages
export async function GET() {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;
  const adminErr = requireAdmin(session);
  if (adminErr) return adminErr;

  const languages = await prisma.language.findMany({ orderBy: { code: "asc" } });
  return successResponse(languages);
}

// POST /api/admin/languages — create a new language
export async function POST(request) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;
  const adminErr = requireAdmin(session);
  if (adminErr) return adminErr;

  const body = await request.json();
  const { code, name, nativeName, isActive = true, isDefault = false } = body;

  if (!code || !name || !nativeName) {
    return errorResponse("VALIDATION_ERROR", "code, name und nativeName sind erforderlich", 400);
  }

  const normalizedCode = code.toLowerCase().trim();

  const existing = await prisma.language.findUnique({ where: { code: normalizedCode } });
  if (existing) {
    return errorResponse("VALIDATION_ERROR", `Sprache mit Code "${normalizedCode}" existiert bereits`, 409);
  }

  // If setting as default, unset previous default
  if (isDefault) {
    await prisma.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }

  const language = await prisma.language.create({
    data: { code: normalizedCode, name: name.trim(), nativeName: nativeName.trim(), isActive, isDefault },
  });

  return successResponse(language, 201);
}
