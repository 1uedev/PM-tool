import { cookies } from "next/headers";
import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// PATCH /api/users/me/language — set preferred language
export async function PATCH(request) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const body = await request.json();
  const { code } = body;

  if (!code) {
    return errorResponse("VALIDATION_ERROR", "code ist erforderlich", 400);
  }

  // Verify language exists and is active
  const language = await prisma.language.findUnique({ where: { code } });
  if (!language || !language.isActive) {
    return errorResponse("NOT_FOUND", "Sprache nicht verfügbar", 404);
  }

  // Update user preference in DB
  await prisma.user.update({
    where: { id: session.user.id },
    data: { preferredLanguage: code },
  });

  // Set locale cookie (30 days)
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", code, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  return successResponse({ code });
}
