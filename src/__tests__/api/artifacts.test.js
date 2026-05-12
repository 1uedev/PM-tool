import { vi, describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/projects/[projectId]/artifacts/route.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import prisma from "@/lib/prisma.js";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma.js", () => ({
  default: {
    artifact: { findMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/middleware/auth-guard.js", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/middleware/project-access.js", () => ({
  requireProjectAccess: vi.fn(),
}));

const SESSION = { user: { id: "u-1", email: "test@example.com" } };
const PARAMS = { params: Promise.resolve({ projectId: "p-1" }) };

function authOk() {
  requireAuth.mockResolvedValue({ session: SESSION, response: null });
}
function accessOk(role = "EDITOR") {
  requireProjectAccess.mockResolvedValue({ membership: { role }, response: null });
}
function accessFail(status = 403) {
  requireProjectAccess.mockResolvedValue({
    membership: null,
    response: { data: { error: { code: "FORBIDDEN" } }, status, async json() { return this.data; } },
  });
}
function makeRequest(url = "http://localhost/api/projects/p-1/artifacts", body = null) {
  return { url, json: async () => body };
}

beforeEach(() => vi.clearAllMocks());

// ── GET /api/projects/:id/artifacts ────────────────────────────────────────

describe("GET /api/projects/:id/artifacts", () => {
  it("returns 401 when unauthenticated", async () => {
    requireAuth.mockResolvedValue({ session: null, response: { status: 401, data: { error: {} }, async json() { return this.data; } } });
    const res = await GET(makeRequest(), PARAMS);
    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks project access", async () => {
    authOk();
    accessFail();
    const res = await GET(makeRequest(), PARAMS);
    expect(res.status).toBe(403);
  });

  it("returns artifact list filtered to non-deleted", async () => {
    authOk();
    accessOk("VIEWER");
    const artifacts = [
      { id: "a-1", type: "USER_PERSONA", title: "Alice", status: "DRAFT", createdAt: new Date(), updatedAt: new Date() },
      { id: "a-2", type: "FEATURE", title: "Search", status: "DONE", createdAt: new Date(), updatedAt: new Date() },
    ];
    prisma.artifact.findMany.mockResolvedValue(artifacts);

    const res = await GET(makeRequest(), PARAMS);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toMatchObject({ id: "a-1", type: "USER_PERSONA" });
    expect(prisma.artifact.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ projectId: "p-1", deleted: false }),
    }));
  });

  it("filters by type when ?type= param is provided", async () => {
    authOk();
    accessOk("VIEWER");
    prisma.artifact.findMany.mockResolvedValue([]);

    const req = makeRequest("http://localhost/api/projects/p-1/artifacts?type=USER_PERSONA");
    await GET(req, PARAMS);
    expect(prisma.artifact.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ type: "USER_PERSONA" }),
    }));
  });

  it("returns 500 when prisma throws", async () => {
    authOk();
    accessOk();
    prisma.artifact.findMany.mockRejectedValue(new Error("db error"));
    const res = await GET(makeRequest(), PARAMS);
    expect(res.status).toBe(500);
  });
});

// ── POST /api/projects/:id/artifacts ───────────────────────────────────────

describe("POST /api/projects/:id/artifacts", () => {
  it("returns 403 for VIEWER role", async () => {
    authOk();
    accessFail();
    const res = await POST(makeRequest(undefined, { type: "USER_PERSONA", title: "T" }), PARAMS);
    expect(res.status).toBe(403);
  });

  it("returns 400 for missing type", async () => {
    authOk();
    accessOk();
    const res = await POST(makeRequest(undefined, { title: "No Type" }), PARAMS);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for empty title", async () => {
    authOk();
    accessOk();
    const res = await POST(makeRequest(undefined, { type: "USER_PERSONA", title: "" }), PARAMS);
    expect(res.status).toBe(400);
  });

  it("creates artifact with merged default fields and initial version", async () => {
    authOk();
    accessOk();
    const created = {
      id: "a-new", type: "USER_PERSONA", title: "Alice",
      status: "DRAFT", fields: JSON.stringify({ name: "", goals: "", painPoints: "", context: "" }),
      projectId: "p-1", deleted: false, createdAt: new Date(), updatedAt: new Date(),
    };
    prisma.artifact.create.mockResolvedValue(created);

    const res = await POST(makeRequest(undefined, { type: "USER_PERSONA", title: "Alice" }), PARAMS);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toMatchObject({ id: "a-new", type: "USER_PERSONA", title: "Alice" });
    expect(typeof body.data.fields).toBe("object");

    // Version is created inside the artifact create transaction
    expect(prisma.artifact.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        title: "Alice",
        type: "USER_PERSONA",
        projectId: "p-1",
        versions: expect.objectContaining({ create: expect.objectContaining({ version: 1 }) }),
      }),
    }));
  });

  it("returns 500 when prisma throws", async () => {
    authOk();
    accessOk();
    prisma.artifact.create.mockRejectedValue(new Error("db error"));
    const res = await POST(makeRequest(undefined, { type: "USER_PERSONA", title: "Crash" }), PARAMS);
    expect(res.status).toBe(500);
  });
});
