import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { validateBody } from "@/lib/validators/index.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  role: z.enum(["VIEWER", "EDITOR", "OWNER"]).default("EDITOR"),
});

// GET /api/projects/:id/members — list all members (VIEWER+)
export async function GET(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "VIEWER");
  if (accessErr) return accessErr;

  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });

    return successResponse(
      members.map((m) => ({
        id: m.id,
        role: m.role,
        createdAt: m.createdAt,
        user: m.user,
        isCurrentUser: m.user.id === session.user.id,
      }))
    );
  } catch (error) {
    console.error("[GET /members]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}

// POST /api/projects/:id/members — invite user by email (OWNER only)
export async function POST(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "OWNER");
  if (accessErr) return accessErr;

  const { data, response: validErr } = await validateBody(request, inviteSchema);
  if (validErr) return validErr;

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, name: true, email: true },
    });
    if (!user) {
      return errorResponse("NOT_FOUND", "Kein Benutzer mit dieser E-Mail-Adresse gefunden", 404);
    }

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });
    if (existing) {
      return errorResponse("VALIDATION_ERROR", "Dieser Benutzer ist bereits Mitglied", 400);
    }

    const member = await prisma.projectMember.create({
      data: { userId: user.id, projectId, role: data.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return successResponse(
      { id: member.id, role: member.role, createdAt: member.createdAt, user: member.user, isCurrentUser: false },
      201
    );
  } catch (error) {
    console.error("[POST /members]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
