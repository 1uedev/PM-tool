import prisma from "@/lib/prisma.js";

// GET /api/health — liveness + DB connectivity (used by Docker healthcheck)
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", db: "ok" });
  } catch (error) {
    console.error("[GET /api/health]", error);
    return Response.json({ status: "error", db: "unreachable" }, { status: 503 });
  }
}
