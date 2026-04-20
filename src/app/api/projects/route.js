import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { validateBody } from "@/lib/validators/index.js";
import { createProjectSchema } from "@/lib/validators/project.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/projects — list all projects the current user is a member of
export async function GET() {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: session.user.id },
      include: {
        project: {
          include: {
            _count: { select: { artifacts: { where: { deleted: false } } } },
          },
        },
      },
      orderBy: { project: { updatedAt: "desc" } },
    });

    const projects = memberships.map(({ role, project }) => ({
      ...project,
      role,
      artifactCount: project._count.artifacts,
      _count: undefined,
    }));

    return successResponse(projects);
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}

// POST /api/projects — create a new project; creator becomes OWNER
export async function POST(request) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { data, response: validErr } = await validateBody(request, createProjectSchema);
  if (validErr) return validErr;

  try {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        members: {
          create: { userId: session.user.id, role: "OWNER" },
        },
      },
    });

    return successResponse(project, 201);
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
