import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma.js";
import { registerSchema } from "@/lib/validators/auth.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

export async function POST(request) {
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
