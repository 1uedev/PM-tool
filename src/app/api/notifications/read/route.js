import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";

// PATCH /api/notifications/read — mark notifications as read
// Body: { ids?: string[] } — omit ids to mark all as read
export async function PATCH(request) {
  const { session, response: authErr } = await requireAuth();
  if (authErr) return authErr;

  let body = {};
  try { body = await request.json(); } catch { /* empty body = mark all */ }

  const ids = Array.isArray(body.ids) ? body.ids : null;

  try {
    const { count } = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
        ...(ids ? { id: { in: ids } } : {}),
      },
      data: { read: true },
    });

    return successResponse({ updated: count });
  } catch (error) {
    console.error("[PATCH /notifications/read]", error);
    return errorResponse("SERVER_ERROR", "Interner Serverfehler", 500);
  }
}
