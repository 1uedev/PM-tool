import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import { z } from "zod";
import { errorResponse, successResponse } from "@/lib/errors.js";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100),
});

// GET /api/users/me — current user profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return errorResponse("AUTH_ERROR", "Nicht authentifiziert", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, systemRole: true, createdAt: true },
  });
  if (!user) return errorResponse("NOT_FOUND", "Benutzer nicht gefunden", 404);

  return successResponse(user);
}

// PATCH /api/users/me — update display name
export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) return errorResponse("AUTH_ERROR", "Nicht authentifiziert", 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Ungültiger Request-Body", 400);
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    const details = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v])
    );
    return errorResponse("VALIDATION_ERROR", "Validierungsfehler", 400, details);
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name.trim() },
    select: { id: true, email: true, name: true, systemRole: true },
  });

  return successResponse(updated);
}
