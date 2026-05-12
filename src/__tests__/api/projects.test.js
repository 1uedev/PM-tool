import { vi, describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/projects/route.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import prisma from "@/lib/prisma.js";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma.js", () => ({
  default: {
    projectMember: { findMany: vi.fn() },
    project: { create: vi.fn() },
  },
}));

vi.mock("@/lib/middleware/auth-guard.js", () => ({
  requireAuth: vi.fn(),
}));

const SESSION = { user: { id: "u-1", email: "test@example.com", systemRole: "USER" } };

function authOk() {
  requireAuth.mockResolvedValue({ session: SESSION, response: null });
}
function authFail() {
  requireAuth.mockResolvedValue({
    session: null,
    response: { data: { error: { code: "AUTH_ERROR" } }, status: 401, async json() { return this.data; } },
  });
}
function makeRequest(body = null) {
  return { json: async () => body };
}

beforeEach(() => vi.clearAllMocks());

// ── GET /api/projects ──────────────────────────────────────────────────────

describe("GET /api/projects", () => {
  it("returns 401 when unauthenticated", async () => {
    authFail();
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns project list for authenticated user", async () => {
    authOk();
    const memberRows = [
      {
        role: "OWNER",
        project: {
          id: "p-1", name: "Alpha", description: null, status: "ACTIVE",
          createdAt: new Date(), updatedAt: new Date(),
          _count: { artifacts: 3 },
        },
      },
      {
        role: "EDITOR",
        project: {
          id: "p-2", name: "Beta", description: "desc", status: "ACTIVE",
          createdAt: new Date(), updatedAt: new Date(),
          _count: { artifacts: 0 },
        },
      },
    ];
    prisma.projectMember.findMany.mockResolvedValue(memberRows);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toMatchObject({ id: "p-1", role: "OWNER", artifactCount: 3 });
    expect(body.data[0]._count).toBeUndefined();
    expect(body.data[1]).toMatchObject({ id: "p-2", role: "EDITOR", artifactCount: 0 });
  });

  it("returns 500 when prisma throws", async () => {
    authOk();
    prisma.projectMember.findMany.mockRejectedValue(new Error("db error"));
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("SERVER_ERROR");
  });
});

// ── POST /api/projects ─────────────────────────────────────────────────────

describe("POST /api/projects", () => {
  it("returns 401 when unauthenticated", async () => {
    authFail();
    const res = await POST(makeRequest({ name: "New" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for missing name", async () => {
    authOk();
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for empty name string", async () => {
    authOk();
    const res = await POST(makeRequest({ name: "" }));
    expect(res.status).toBe(400);
  });

  it("creates project and returns 201", async () => {
    authOk();
    const created = { id: "p-new", name: "My Project", description: null, status: "ACTIVE" };
    prisma.project.create.mockResolvedValue(created);

    const res = await POST(makeRequest({ name: "My Project" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toMatchObject({ id: "p-new", name: "My Project" });
    expect(prisma.project.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        name: "My Project",
        members: { create: { userId: "u-1", role: "OWNER" } },
      }),
    }));
  });

  it("returns 500 when prisma throws", async () => {
    authOk();
    prisma.project.create.mockRejectedValue(new Error("db error"));
    const res = await POST(makeRequest({ name: "Crash" }));
    expect(res.status).toBe(500);
  });
});
