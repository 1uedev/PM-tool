import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/templates — list all templates (any authenticated user)
export async function GET() {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  try {
    const templates = await prisma.projectTemplate.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { name: true, email: true } },
        _count: { select: { artifacts: true } },
      },
    });

    return successResponse(
      templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        artifactCount: t._count.artifacts,
        createdBy: t.createdBy,
        createdAt: t.createdAt,
        isOwn: t.createdById === session.user.id,
      }))
    );
  } catch (error) {
    console.error("[GET /api/templates]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}

// POST /api/templates — create a template from an existing project
// Body: { name, description?, projectId, artifactIds?, includeStarter? }
export async function POST(request) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  let body;
  try { body = await request.json(); } catch {
    return errorResponse("VALIDATION_ERROR", "Ungültiger JSON-Body", 400);
  }

  const { name, description, projectId, artifactIds, includeStarter = true } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return errorResponse("VALIDATION_ERROR", "Name ist erforderlich", 400);
  }
  if (!projectId || typeof projectId !== "string") {
    return errorResponse("VALIDATION_ERROR", "projectId ist erforderlich", 400);
  }

  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "EDITOR");
  if (accessErr) return accessErr;

  try {
    const where = {
      projectId,
      deleted: false,
      ...(Array.isArray(artifactIds) && artifactIds.length > 0
        ? { id: { in: artifactIds } }
        : {}),
    };

    const [artifacts, project] = await Promise.all([
      prisma.artifact.findMany({
        where,
        orderBy: [{ type: "asc" }, { createdAt: "asc" }],
        select: { id: true, type: true, title: true, fields: true },
      }),
      prisma.project.findUnique({
        where: { id: projectId },
        select: { prdStarter: true },
      }),
    ]);

    const template = await prisma.projectTemplate.create({
      data: {
        name: name.trim().slice(0, 120),
        description: description ? String(description).trim().slice(0, 400) : null,
        starter: includeStarter && project?.prdStarter ? project.prdStarter : null,
        createdById: session.user.id,
        artifacts: {
          create: artifacts.map((a, i) => ({
            type: a.type,
            title: a.title,
            fields: typeof a.fields === "string" ? a.fields : JSON.stringify(a.fields),
            sortOrder: i,
          })),
        },
      },
      include: { _count: { select: { artifacts: true } } },
    });

    return successResponse(
      { id: template.id, name: template.name, artifactCount: template._count.artifacts },
      201
    );
  } catch (error) {
    console.error("[POST /api/templates]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
