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
// Optional body field: templateId — pre-populates artifacts + starter from a template
export async function POST(request) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { data, response: validErr } = await validateBody(request, createProjectSchema);
  if (validErr) return validErr;

  try {
    // Optionally load a template to pre-populate the project
    let templateArtifacts = [];
    let templateStarter = null;

    if (data.templateId) {
      const tmpl = await prisma.projectTemplate.findUnique({
        where: { id: data.templateId },
        include: { artifacts: { orderBy: { sortOrder: "asc" } } },
      });
      if (tmpl) {
        templateArtifacts = tmpl.artifacts;
        templateStarter = tmpl.starter ?? null;
      }
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        prdStarter: templateStarter,
        members: {
          create: { userId: session.user.id, role: "OWNER" },
        },
        artifacts: templateArtifacts.length > 0
          ? {
              create: templateArtifacts.map((a) => ({
                type: a.type,
                title: a.title,
                status: "DRAFT",
                fields: a.fields,
                versions: {
                  create: {
                    version: 1,
                    title: a.title,
                    fields: a.fields,
                    status: "DRAFT",
                    authorId: session.user.id,
                  },
                },
              })),
            }
          : undefined,
      },
    });

    return successResponse(project, 201);
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
