import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/projects/:id/search?q=...&type=...&status=... — full-text search over artifacts
export async function GET(request, { params }) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { projectId } = await params;
  const { response: accessErr } = await requireProjectAccess(
    session.user.id, projectId, "VIEWER"
  );
  if (accessErr) return accessErr;

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    const type = searchParams.get("type") ?? "";
    const status = searchParams.get("status") ?? "";
    const tag = searchParams.get("tag") ?? "";

    if (!q && !type && !status && !tag) {
      return successResponse([]);
    }

    const where = {
      projectId,
      deleted: false,
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { fields: { contains: q } },
            ],
          }
        : {}),
    };

    const artifacts = await prisma.artifact.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        fields: true,
        updatedAt: true,
      },
    });

    // Parse fields JSON and build result with match context
    const results = artifacts.map((a) => {
      let fields = {};
      try {
        fields = typeof a.fields === "string" ? JSON.parse(a.fields) : a.fields;
      } catch {
        // ignore parse errors
      }

      // Find first field that contains the query string for snippet
      let snippet = null;
      if (q) {
        const lower = q.toLowerCase();
        for (const [, value] of Object.entries(fields)) {
          if (typeof value === "string" && value.toLowerCase().includes(lower)) {
            const idx = value.toLowerCase().indexOf(lower);
            const start = Math.max(0, idx - 40);
            const end = Math.min(value.length, idx + q.length + 40);
            snippet = (start > 0 ? "…" : "") + value.slice(start, end) + (end < value.length ? "…" : "");
            break;
          }
        }
      }

      return { id: a.id, type: a.type, title: a.title, status: a.status, updatedAt: a.updatedAt, snippet };
    });

    return successResponse(results);
  } catch (error) {
    console.error("[GET /search]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
