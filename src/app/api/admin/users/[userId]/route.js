import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma.js";
import { requireAdmin } from "@/lib/middleware/admin-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { updateUserSchema, safeUser } from "@/lib/validators/user.js";

export async function GET(_req, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return errorResponse("NOT_FOUND", "Benutzer nicht gefunden", 404);

  return successResponse(safeUser(user));
}

export async function PATCH(request, { params }) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const { userId } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Ungültiger JSON-Body", 400);
  }

  const result = updateUserSchema.safeParse(body);
  if (!result.success) {
    return errorResponse("VALIDATION_ERROR", "Validierungsfehler", 400, result.error.flatten().fieldErrors);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return errorResponse("NOT_FOUND", "Benutzer nicht gefunden", 404);

  // Prevent admin from deactivating themselves
  if (userId === session.user.id && result.data.status === "INACTIVE") {
    return errorResponse("FORBIDDEN", "Du kannst dein eigenes Konto nicht deaktivieren", 400);
  }

  // Prevent removing own admin role
  if (userId === session.user.id && result.data.systemRole && result.data.systemRole !== "ADMIN") {
    return errorResponse("FORBIDDEN", "Du kannst dir selbst die Admin-Rolle nicht entziehen", 400);
  }

  const updateData = { ...result.data };

  if (updateData.password) {
    updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
    delete updateData.password;
  }

  if (updateData.firstName !== undefined || updateData.lastName !== undefined) {
    const firstName = updateData.firstName ?? user.firstName ?? "";
    const lastName = updateData.lastName ?? user.lastName ?? "";
    updateData.name = `${firstName} ${lastName}`.trim();
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return successResponse(safeUser(updated));
}

export async function DELETE(_req, { params }) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const { userId } = await params;

  if (userId === session.user.id) {
    return errorResponse("FORBIDDEN", "Du kannst dein eigenes Konto nicht löschen", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return errorResponse("NOT_FOUND", "Benutzer nicht gefunden", 404);

  // Soft delete: deactivate instead of physical deletion
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status: "INACTIVE" },
  });

  return successResponse(safeUser(updated));
}
