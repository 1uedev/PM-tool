import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { ARTIFACT_GROUPS } from "@/lib/constants.js";

const TYPE_ORDER = ARTIFACT_GROUPS.flatMap((g) => g.types);

// GET /api/projects/:id/progress — aggregate stats per artifact type
export async function GET(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId } = await params;
  const { response: accessErr } = await requireProjectAccess(session.user.id, projectId, "VIEWER");
  if (accessErr) return accessErr;

  try {
    const artifacts = await prisma.artifact.findMany({
      where: { projectId, deleted: false },
      select: { type: true, status: true },
    });

    // Aggregate per type
    const phases = TYPE_ORDER.map((type) => {
      const ofType = artifacts.filter((a) => a.type === type);
      const total = ofType.length;
      const done = ofType.filter((a) => a.status === "DONE").length;
      const inReview = ofType.filter((a) => a.status === "IN_REVIEW").length;
      const draft = ofType.filter((a) => a.status === "DRAFT").length;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;

      return { type, total, done, inReview, draft, progress, missing: total === 0 };
    });

    const totalArtifacts = artifacts.length;
    const totalDone = artifacts.filter((a) => a.status === "DONE").length;
    const overallProgress = totalArtifacts > 0
      ? Math.round((totalDone / totalArtifacts) * 100)
      : 0;
    const missingTypes = phases.filter((p) => p.missing).length;

    return successResponse({ phases, totalArtifacts, totalDone, overallProgress, missingTypes });
  } catch (error) {
    console.error("[GET /progress]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
