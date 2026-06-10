import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { successResponse } from "@/lib/errors.js";
import { STARTER_DEFAULTS } from "@/lib/starterContext.js";
import prisma from "@/lib/prisma.js";

export const GET = withProjectRoute({ role: "VIEWER" }, async (request, { params }) => {
  const { projectId } = params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { prdStarter: true },
  });

  let starter = STARTER_DEFAULTS;
  if (project?.prdStarter) {
    try {
      starter = JSON.parse(project.prdStarter);
    } catch {
      // Corrupted JSON — fall back to defaults silently
      starter = STARTER_DEFAULTS;
    }
  }

  return successResponse({ starter });
});

export const PATCH = withProjectRoute({ role: "EDITOR" }, async (request, { params }) => {
  const { projectId } = params;

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
});
