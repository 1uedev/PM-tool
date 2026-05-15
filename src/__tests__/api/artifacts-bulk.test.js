import { vi, describe, it, expect, beforeEach } from "vitest";
import { POST } from "@/app/api/projects/[projectId]/artifacts/bulk/route.js";
import prisma from "@/lib/prisma.js";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma.js", () => ({
  default: {
    artifact: { create: vi.fn() },
    relation: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth.js", () => ({ authOptions: {} }));
vi.mock("@/lib/middleware/project-access.js", () => ({
  requireProjectAccess: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";

const SESSION = { user: { id: "u-1" } };
const PARAMS = { params: Promise.resolve({ projectId: "p-1" }) };

function authOk() {
  getServerSession.mockResolvedValue(SESSION);
}
function accessOk() {
  requireProjectAccess.mockResolvedValue({ membership: { role: "EDITOR" }, response: null });
}
function makeRequest(body) {
  return { json: async () => body };
}

beforeEach(() => vi.clearAllMocks());

// ── Tests ──────────────────────────────────────────────────────────────────

describe("POST /api/projects/:id/artifacts/bulk", () => {
  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ artifacts: [] }), PARAMS);
    expect(res.status).toBe(401);
  });

  it("returns 400 for empty artifacts array", async () => {
    authOk();
    accessOk();
    const res = await POST(makeRequest({ artifacts: [] }), PARAMS);
    expect(res.status).toBe(400);
  });

  it("returns 400 when over the bulk limit", async () => {
    authOk();
    accessOk();
    const many = Array.from({ length: 101 }, () => ({
      type: "FEATURE",
      title: "x",
      fields: {},
    }));
    const res = await POST(makeRequest({ artifacts: many }), PARAMS);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid artifact type", async () => {
    authOk();
    accessOk();
    const res = await POST(
      makeRequest({ artifacts: [{ type: "NOT_REAL", title: "X", fields: {} }] }),
      PARAMS
    );
    expect(res.status).toBe(400);
  });

  it("creates artifacts with version 1 inside a transaction", async () => {
    authOk();
    accessOk();

    // $transaction is invoked with an async callback that receives a tx.
    // We simulate it by calling the callback with a stubbed tx.
    const createdArtifacts = [
      { id: "art-1", type: "FEATURE", title: "Search", status: "DRAFT" },
    ];
    prisma.$transaction.mockImplementation(async (cb) => {
      const tx = {
        artifact: { create: vi.fn().mockResolvedValue(createdArtifacts[0]) },
        relation: { create: vi.fn() },
      };
      return cb(tx);
    });

    const res = await POST(
      makeRequest({
        artifacts: [{ type: "FEATURE", title: "Search", fields: { description: "..." } }],
      }),
      PARAMS
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.created).toHaveLength(1);
    expect(body.data.count).toBe(1);
  });

  it("creates relations between artifacts using clientId mapping", async () => {
    authOk();
    accessOk();

    const createdArtifacts = [
      { id: "art-1", type: "PRODUCT_VISION", title: "V" },
      { id: "art-2", type: "FEATURE", title: "F" },
    ];
    const createdRelations = [
      { id: "rel-1", sourceId: "art-2", targetId: "art-1", type: "DERIVES_FROM" },
    ];
    const relCreate = vi.fn().mockResolvedValue(createdRelations[0]);

    prisma.$transaction.mockImplementation(async (cb) => {
      let callIdx = 0;
      const tx = {
        artifact: {
          create: vi.fn().mockImplementation(async () => createdArtifacts[callIdx++]),
        },
        relation: { create: relCreate },
      };
      return cb(tx);
    });

    const res = await POST(
      makeRequest({
        artifacts: [
          { clientId: "a1", type: "PRODUCT_VISION", title: "V", fields: {} },
          { clientId: "a2", type: "FEATURE", title: "F", fields: {} },
        ],
        relations: [
          { sourceClientId: "a2", targetClientId: "a1", type: "DERIVES_FROM" },
        ],
      }),
      PARAMS
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.created).toHaveLength(2);
    expect(body.data.relations).toHaveLength(1);
    expect(relCreate).toHaveBeenCalledWith({
      data: { sourceId: "art-2", targetId: "art-1", type: "DERIVES_FROM" },
      select: { id: true, sourceId: true, targetId: true, type: true },
    });
  });

  it("ignores relations referencing unknown clientIds and warns", async () => {
    authOk();
    accessOk();
    const created = [{ id: "art-1", type: "FEATURE", title: "F" }];
    prisma.$transaction.mockImplementation(async (cb) => {
      const tx = {
        artifact: { create: vi.fn().mockResolvedValue(created[0]) },
        relation: { create: vi.fn() },
      };
      return cb(tx);
    });

    const res = await POST(
      makeRequest({
        artifacts: [{ clientId: "a1", type: "FEATURE", title: "F", fields: {} }],
        relations: [
          { sourceClientId: "a1", targetClientId: "missing", type: "DERIVES_FROM" },
        ],
      }),
      PARAMS
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.relations).toHaveLength(0);
    expect(body.data.warnings.length).toBeGreaterThan(0);
  });

  it("ignores relations with invalid type and warns", async () => {
    authOk();
    accessOk();
    const created = [
      { id: "art-1", type: "FEATURE", title: "F" },
      { id: "art-2", type: "USER_STORY", title: "S" },
    ];
    prisma.$transaction.mockImplementation(async (cb) => {
      let idx = 0;
      const tx = {
        artifact: { create: vi.fn().mockImplementation(async () => created[idx++]) },
        relation: { create: vi.fn() },
      };
      return cb(tx);
    });

    const res = await POST(
      makeRequest({
        artifacts: [
          { clientId: "a1", type: "FEATURE", title: "F", fields: {} },
          { clientId: "a2", type: "USER_STORY", title: "S", fields: {} },
        ],
        relations: [
          { sourceClientId: "a1", targetClientId: "a2", type: "FAKE_TYPE" },
        ],
      }),
      PARAMS
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.relations).toHaveLength(0);
    expect(body.data.warnings.some((w) => w.includes("FAKE_TYPE"))).toBe(true);
  });
});
