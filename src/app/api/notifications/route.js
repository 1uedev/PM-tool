import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// GET /api/notifications?limit=30 — returns recent notifications + unread count
export async function GET(request) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "30", 10), 100);

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          type: true,
          read: true,
          artifactId: true,
          projectId: true,
          meta: true,
          createdAt: true,
          actor: { select: { name: true, email: true } },
        },
      }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
    ]);

    const parsed = notifications.map((n) => ({
      ...n,
      meta: (() => { try { return JSON.parse(n.meta); } catch { return {}; } })(),
    }));

    return successResponse({ notifications: parsed, unreadCount });
  } catch (error) {
    console.error("[GET /notifications]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
