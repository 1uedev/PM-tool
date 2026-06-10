import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import prisma from "@/lib/prisma.js";
import { z } from "zod";
import { errorResponse, successResponse } from "@/lib/errors.js";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Aktuelles Passwort ist erforderlich"),
  newPassword: z.string().min(8, "Neues Passwort muss mindestens 8 Zeichen haben"),
});

// POST /api/users/me/password — change own password
export async function POST(request) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Ungültiger Request-Body", 400);
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    const details = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v])
    );
    return errorResponse("VALIDATION_ERROR", "Validierungsfehler", 400, details);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) return errorResponse("NOT_FOUND", "Benutzer nicht gefunden", 404);

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return errorResponse("VALIDATION_ERROR", "Aktuelles Passwort ist falsch", 400, {
      currentPassword: ["Aktuelles Passwort ist falsch"],
    });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  return successResponse({ changed: true });
}
