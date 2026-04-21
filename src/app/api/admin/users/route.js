import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma.js";
import { requireAdmin } from "@/lib/middleware/admin-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { createUserSchema, safeUser } from "@/lib/validators/user.js";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return successResponse(users.map(safeUser));
}

export async function POST(request) {
  const { response } = await requireAdmin();
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Ungültiger JSON-Body", 400);
  }

  const result = createUserSchema.safeParse(body);
  if (!result.success) {
    return errorResponse("VALIDATION_ERROR", "Validierungsfehler", 400, result.error.flatten().fieldErrors);
  }

  const { email, password, firstName, lastName, systemRole, status } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return errorResponse("VALIDATION_ERROR", "Diese E-Mail-Adresse ist bereits vergeben", 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const fullName = `${firstName} ${lastName}`.trim();

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      name: fullName,
      systemRole,
      status,
    },
  });

  return successResponse(safeUser(user), 201);
}
