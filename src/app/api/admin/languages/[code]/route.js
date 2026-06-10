import prisma from "@/lib/prisma.js";
import { requireAdmin } from "@/lib/middleware/auth-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// PATCH /api/admin/languages/[code] — update language (toggle active, set default)
export async function PATCH(request, { params }) {
  const { response: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const { code } = await params;
  const body = await request.json();

  const language = await prisma.language.findUnique({ where: { code } });
  if (!language) return errorResponse("NOT_FOUND", "Sprache nicht gefunden", 404);

  // Prevent deactivating the default language
  if (body.isActive === false && language.isDefault) {
    return errorResponse("VALIDATION_ERROR", "Die Standardsprache kann nicht deaktiviert werden", 400);
  }

  const updates = {};
  if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (typeof body.nativeName === "string") updates.nativeName = body.nativeName.trim();

  // Setting as default: unset previous default first
  if (body.isDefault === true) {
    await prisma.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    updates.isDefault = true;
    updates.isActive = true; // default must be active
  }

  const updated = await prisma.language.update({ where: { code }, data: updates });
  return successResponse(updated);
}

// DELETE /api/admin/languages/[code]
export async function DELETE(request, { params }) {
  const { response: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const { code } = await params;

  const language = await prisma.language.findUnique({ where: { code } });
  if (!language) return errorResponse("NOT_FOUND", "Sprache nicht gefunden", 404);

  if (language.isDefault) {
    return errorResponse("VALIDATION_ERROR", "Die Standardsprache kann nicht gelöscht werden", 400);
  }

  await prisma.language.delete({ where: { code } });
  return successResponse({ deleted: true });
}
