import { vi, describe, it, expect, beforeEach } from "vitest";
import { GET, PATCH, DELETE } from "@/app/api/projects/[projectId]/artifacts/[artifactId]/route.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess, requireArtifactAccess } from "@/lib/middleware/project-access.js";
import prisma from "@/lib/prisma.js";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma.js", () => ({
  default: {
    artifact: { update: vi.fn() },
    artifactVersion: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/middleware/auth-guard.js", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/middleware/project-access.js", () => ({
  requireProjectAccess: vi.fn(),
  requireArtifactAccess: vi.fn(),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

const SESSION = { user: { id: "u-1" } };
const PARAMS = { params: Promise.resolve({ projectId: "p-1", artifactId: "a-1" }) };

const ARTIFACT = {
  id: "a-1", type: "USER_PERSONA", title: "Alice", status: "DRAFT",
  fields: JSON.stringify({ name: "Alice", goals: "world domination", painPoints: "", context: "" }),
  projectId: "p-1", deleted: false, createdAt: new Date(), updatedAt: new Date(),
};

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
function artifactOk(artifact = ARTIFACT) {
  requireArtifactAccess.mockResolvedValue({ artifact, response: null });
}
function artifactMissing() {
  requireArtifactAccess.mockResolvedValue({
    artifact: null,
    response: { data: { error: { code: "NOT_FOUND" } }, status: 404, async json() { return this.data; } },
  });
}
function makeRequest(body = null) {
  return { json: async () => body };
}

beforeEach(() => vi.clearAllMocks());

// ── GET /api/projects/:id/artifacts/:aid ───────────────────────────────────

describe("GET /api/projects/:id/artifacts/:aid", () => {
  it("returns 401 when unauthenticated", async () => {
    requireAuth.mockResolvedValue({ session: null, response: { status: 401, data: {}, async json() { return this.data; } } });
    const res = await GET(makeRequest(), PARAMS);
    expect(res.status).toBe(401);
  });

  it("returns 404 when artifact not found", async () => {
    authOk();
    accessOk("VIEWER");
    artifactMissing();
    const res = await GET(makeRequest(), PARAMS);
    expect(res.status).toBe(404);
  });

  it("returns artifact with fields parsed from JSON string", async () => {
    authOk();
    accessOk("VIEWER");
    artifactOk();
    const res = await GET(makeRequest(), PARAMS);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe("a-1");
    expect(typeof body.data.fields).toBe("object");
    expect(body.data.fields.goals).toBe("world domination");
  });

  it("returns artifact with fields that are already an object", async () => {
    authOk();
    accessOk("VIEWER");
    artifactOk({ ...ARTIFACT, fields: { name: "Alice", goals: "parsed", painPoints: "", context: "" } });
    const res = await GET(makeRequest(), PARAMS);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.fields.goals).toBe("parsed");
  });
});

// ── PATCH /api/projects/:id/artifacts/:aid ─────────────────────────────────

describe("PATCH /api/projects/:id/artifacts/:aid", () => {
  it("returns 403 for VIEWER role", async () => {
    authOk();
    accessFail();
    const res = await PATCH(makeRequest({ title: "x" }), PARAMS);
    expect(res.status).toBe(403);
  });

  it("returns 400 for invalid status value", async () => {
    authOk();
    accessOk();
    artifactOk();
    const res = await PATCH(makeRequest({ status: "INVALID_STATUS" }), PARAMS);
    expect(res.status).toBe(400);
  });

  it("updates title and creates new version", async () => {
    authOk();
    accessOk();
    artifactOk();
    prisma.artifactVersion.findFirst.mockResolvedValue({ version: 2 });
    const updated = { ...ARTIFACT, title: "Alice Updated", updatedAt: new Date() };
    prisma.artifact.update.mockResolvedValue(updated);

    const res = await PATCH(makeRequest({ title: "Alice Updated" }), PARAMS);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.title).toBe("Alice Updated");

    expect(prisma.artifact.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "a-1" },
      data: expect.objectContaining({
        title: "Alice Updated",
        versions: expect.objectContaining({
          create: expect.objectContaining({ version: 3, title: "Alice Updated" }),
        }),
      }),
    }));
  });

  it("merges fields instead of replacing them", async () => {
    authOk();
    accessOk();
    artifactOk();
    prisma.artifactVersion.findFirst.mockResolvedValue({ version: 1 });
    const updated = { ...ARTIFACT };
    prisma.artifact.update.mockResolvedValue(updated);

    await PATCH(makeRequest({ fields: { goals: "new goals" } }), PARAMS);

    const updateCall = prisma.artifact.update.mock.calls[0][0];
    const savedFields = JSON.parse(updateCall.data.fields);
    // existing fields are preserved
    expect(savedFields.name).toBe("Alice");
    expect(savedFields.goals).toBe("new goals");
    expect(savedFields.painPoints).toBe("");
  });

  it("returns 500 when prisma throws", async () => {
    authOk();
    accessOk();
    artifactOk();
    prisma.artifactVersion.findFirst.mockResolvedValue(null);
    prisma.artifact.update.mockRejectedValue(new Error("db error"));
    const res = await PATCH(makeRequest({ title: "Crash" }), PARAMS);
    expect(res.status).toBe(500);
  });
});

// ── DELETE /api/projects/:id/artifacts/:aid ────────────────────────────────

describe("DELETE /api/projects/:id/artifacts/:aid", () => {
  it("returns 403 for VIEWER role", async () => {
    authOk();
    accessFail();
    const res = await DELETE(makeRequest(), PARAMS);
    expect(res.status).toBe(403);
  });

  it("returns 404 when artifact not found", async () => {
    authOk();
    accessOk();
    artifactMissing();
    const res = await DELETE(makeRequest(), PARAMS);
    expect(res.status).toBe(404);
  });

  it("soft-deletes artifact (sets deleted: true)", async () => {
    authOk();
    accessOk();
    artifactOk();
    prisma.artifact.update.mockResolvedValue({ ...ARTIFACT, deleted: true });

    const res = await DELETE(makeRequest(), PARAMS);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.deleted).toBe(true);

    expect(prisma.artifact.update).toHaveBeenCalledWith({
      where: { id: "a-1" },
      data: { deleted: true },
    });
  });

  it("returns 500 when prisma throws", async () => {
    authOk();
    accessOk();
    artifactOk();
    prisma.artifact.update.mockRejectedValue(new Error("db error"));
    const res = await DELETE(makeRequest(), PARAMS);
    expect(res.status).toBe(500);
  });
});
