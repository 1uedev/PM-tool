import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import { requireAdmin } from "@/lib/middleware/admin-guard.js";
import prisma from "@/lib/prisma.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/admin/audit?page=1&limit=50&action=ARTIFACT_DELETE
export async function GET(request) {
  const session = await getServerSession(authOptions);
  const { response: adminErr } = await requireAdmin(session);
  if (adminErr) return adminErr;

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10)));
  const action = url.searchParams.get("action") ?? "";

  const where = action ? { action } : {};

  try {
    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return successResponse({ entries, total, page, limit });
  } catch (error) {
    console.error("[GET /api/admin/audit]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
