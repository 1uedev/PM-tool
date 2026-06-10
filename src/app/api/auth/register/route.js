import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma.js";
import { registerSchema } from "@/lib/validators/auth.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit.js";

// 10 registrations per 15 minutes per IP
const REGISTER_RATE_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

export async function POST(request) {
  // Self-service registration is opt-in — admin-created accounts are the
  // intended model. Enable with REGISTRATION_ENABLED="true".
  if (process.env.REGISTRATION_ENABLED !== "true") {
    return errorResponse("FORBIDDEN", "Die Selbstregistrierung ist deaktiviert. Bitte wende dich an einen Administrator.", 403);
  }

  const rate = consumeRateLimit(`register:${getClientIp(request)}`, REGISTER_RATE_LIMIT);
  if (!rate.ok) {
    return errorResponse(
      "RATE_LIMITED",
      "Zu viele Registrierungen — bitte später erneut versuchen",
      429,
      { retryAfterSec: rate.retryAfterSec }
    );
  }

  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Ungültige Eingabedaten",
        400,
        result.error.flatten().fieldErrors
      );
    }

    const { email, password, name } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Diese E-Mail-Adresse ist bereits registriert",
        400
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash, name: name ?? null },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return successResponse(user, 201);
  } catch (error) {
    console.error("[register]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
