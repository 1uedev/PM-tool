import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { successResponse, errorResponse } from "@/lib/errors.js";
import { STARTER_DEFAULTS } from "@/lib/starterContext.js";
import prisma from "@/lib/prisma.js";

export async function GET(request, { params }) {
  const { projectId } = await params;
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "VIEWER");
  if (accessErr) return accessErr;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { prdStarter: true },
  });

  const starter = project?.prdStarter ? JSON.parse(project.prdStarter) : STARTER_DEFAULTS;
  return successResponse({ starter });
}

export async function PATCH(request, { params }) {
  const { projectId } = await params;
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "EDITOR");
  if (accessErr) return accessErr;

  const body = await request.json();

  // Only allow known starter keys
  const sanitized = Object.fromEntries(
    Object.keys(STARTER_DEFAULTS).map((key) => [key, String(body[key] ?? "")])
  );

  await prisma.project.update({
    where: { id: projectId },
    data: { prdStarter: JSON.stringify(sanitized) },
  });

  return successResponse({ starter: sanitized });
}
