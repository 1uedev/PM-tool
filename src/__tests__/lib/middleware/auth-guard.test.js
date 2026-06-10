import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth.js", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma.js", () => ({
  default: {
    user: { findUnique: vi.fn() },
  },
}));

import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma.js";
import { requireAuth, requireAdmin } from "@/lib/middleware/auth-guard.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireAuth", () => {
  it("returns session when authenticated and user exists in DB", async () => {
    getServerSession.mockResolvedValue({ user: { id: "user-1", systemRole: "USER" } });
    prisma.user.findUnique.mockResolvedValue({ id: "user-1", status: "ACTIVE", systemRole: "USER" });

    const { session, response } = await requireAuth();
    expect(response).toBeNull();
    expect(session.user.id).toBe("user-1");
  });

  it("returns 401 when no session exists", async () => {
    getServerSession.mockResolvedValue(null);

    const { session, response } = await requireAuth();
    expect(session).toBeNull();
    expect(response.status).toBe(401);
    expect(response.data.error.code).toBe("AUTH_ERROR");
  });

  it("returns 401 when session has no user id", async () => {
    getServerSession.mockResolvedValue({ user: {} });

    const { session, response } = await requireAuth();
    expect(session).toBeNull();
    expect(response.status).toBe(401);
  });

  it("returns 401 when user no longer exists in DB (stale JWT)", async () => {
    getServerSession.mockResolvedValue({ user: { id: "deleted-user" } });
    prisma.user.findUnique.mockResolvedValue(null);

    const { session, response } = await requireAuth();
    expect(session).toBeNull();
    expect(response.status).toBe(401);
    expect(response.data.error.message).toMatch(/session expired/i);
  });

  it("returns 401 when the user has been deactivated", async () => {
    getServerSession.mockResolvedValue({ user: { id: "user-1", systemRole: "USER" } });
    prisma.user.findUnique.mockResolvedValue({ id: "user-1", status: "INACTIVE", systemRole: "USER" });

    const { session, response } = await requireAuth();
    expect(session).toBeNull();
    expect(response.status).toBe(401);
  });

  it("verifies the user with a select on id, status and systemRole", async () => {
    getServerSession.mockResolvedValue({ user: { id: "user-1" } });
    prisma.user.findUnique.mockResolvedValue({ id: "user-1", status: "ACTIVE", systemRole: "USER" });

    await requireAuth();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { id: true, status: true, systemRole: true },
    });
  });

  it("overrides the token role with the current DB role", async () => {
    // Token still claims ADMIN, but the user has been demoted in the DB
    getServerSession.mockResolvedValue({ user: { id: "user-1", systemRole: "ADMIN" } });
    prisma.user.findUnique.mockResolvedValue({ id: "user-1", status: "ACTIVE", systemRole: "USER" });

    const { session, response } = await requireAuth();
    expect(response).toBeNull();
    expect(session.user.systemRole).toBe("USER");
  });
});

describe("requireAdmin", () => {
  it("returns session when authenticated user is ADMIN", async () => {
    getServerSession.mockResolvedValue({ user: { id: "admin-1", systemRole: "ADMIN" } });
    prisma.user.findUnique.mockResolvedValue({ id: "admin-1", status: "ACTIVE", systemRole: "ADMIN" });

    const { session, response } = await requireAdmin();
    expect(response).toBeNull();
    expect(session.user.systemRole).toBe("ADMIN");
  });

  it("returns 403 when authenticated user is not ADMIN", async () => {
    getServerSession.mockResolvedValue({ user: { id: "user-1", systemRole: "USER" } });
    prisma.user.findUnique.mockResolvedValue({ id: "user-1", status: "ACTIVE", systemRole: "USER" });

    const { session, response } = await requireAdmin();
    expect(session).toBeNull();
    expect(response.status).toBe(403);
    expect(response.data.error.code).toBe("FORBIDDEN");
  });

  it("returns 403 when the token claims ADMIN but the DB role is USER", async () => {
    getServerSession.mockResolvedValue({ user: { id: "user-1", systemRole: "ADMIN" } });
    prisma.user.findUnique.mockResolvedValue({ id: "user-1", status: "ACTIVE", systemRole: "USER" });

    const { session, response } = await requireAdmin();
    expect(session).toBeNull();
    expect(response.status).toBe(403);
  });

  it("returns 401 when not authenticated", async () => {
    getServerSession.mockResolvedValue(null);

    const { session, response } = await requireAdmin();
    expect(session).toBeNull();
    expect(response.status).toBe(401);
  });
});
