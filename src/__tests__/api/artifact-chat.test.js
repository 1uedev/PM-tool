import { vi, describe, it, expect, beforeEach } from "vitest";
import { POST as CHAT } from "@/app/api/projects/[projectId]/artifacts/[artifactId]/chat/route.js";
import { POST as APPLY } from "@/app/api/projects/[projectId]/artifacts/[artifactId]/chat/apply/route.js";
import prisma from "@/lib/prisma.js";
import { requireAuth } from "@/lib/middleware/auth-guard.js";
import { requireProjectAccess, requireArtifactAccess } from "@/lib/middleware/project-access.js";
import { getAiProvider, isAiAvailable } from "@/lib/ai/provider-factory.js";
import { errorResponse } from "@/lib/errors.js";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma.js", () => {
  const client = {
    artifact: { findUnique: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn() },
    aiSession: { create: vi.fn().mockResolvedValue({}), findFirst: vi.fn().mockResolvedValue(null) },
    artifactVersion: { findFirst: vi.fn() },
    $transaction: vi.fn((cb) => cb(client)),
  };
  return { default: client };
});

vi.mock("@/lib/audit.js", () => ({ logAction: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/middleware/auth-guard.js", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/middleware/project-access.js", () => ({
  requireProjectAccess: vi.fn(),
  requireArtifactAccess: vi.fn(),
}));
vi.mock("@/lib/ai/provider-factory.js", () => ({
  getAiConfig: vi.fn().mockResolvedValue({ provider: "claude" }),
  isAiAvailable: vi.fn().mockReturnValue(true),
  getAiProvider: vi.fn(),
}));
vi.mock("@/lib/rate-limit.js", () => ({ consumeRateLimit: vi.fn().mockReturnValue({ ok: true }) }));

// ── Fixtures ─────────────────────────────────────────────────────────────────

const SESSION = { user: { id: "u-1" } };
const PARAMS = { params: Promise.resolve({ projectId: "p-1", artifactId: "a-1" }) };
const FIELDS = { role: "Admin", action: "einloggen", benefit: "Zugriff" };
const ARTIFACT = {
  id: "a-1",
  type: "USER_STORY",
  title: "Login",
  status: "DRAFT",
  fields: JSON.stringify(FIELDS),
  relationsFrom: [],
  relationsTo: [],
};

function makeRequest(body) {
  return { json: async () => body };
}
function authOk() {
  requireAuth.mockResolvedValue({ session: SESSION, response: null });
}
function accessOk(role = "EDITOR") {
  requireProjectAccess.mockResolvedValue({ membership: { role }, response: null });
}
function artifactOk(a = ARTIFACT) {
  requireArtifactAccess.mockResolvedValue({ artifact: a, response: null });
}

beforeEach(() => {
  vi.clearAllMocks();
  authOk();
  accessOk();
  artifactOk();
  isAiAvailable.mockReturnValue(true);
  prisma.artifact.findUnique.mockResolvedValue(ARTIFACT);
  prisma.user.findUnique.mockResolvedValue({ preferredLanguage: "de" });
  prisma.aiSession.create.mockResolvedValue({});
  prisma.aiSession.findFirst.mockResolvedValue(null);
});

// ── Chat route ───────────────────────────────────────────────────────────────

describe("POST /chat", () => {
  it("returns the reply and a sanitized proposal", async () => {
    getAiProvider.mockReturnValue({
      chat: vi.fn().mockResolvedValue({
        json: { reply: "Darum.", proposal: { field: "action", newValue: "schneller einloggen", rationale: "klarer" } },
        usage: { inputTokens: 5, outputTokens: 7 },
      }),
    });

    const res = await CHAT(makeRequest({ messages: [{ role: "user", content: "Warum?" }] }), PARAMS);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.reply).toBe("Darum.");
    expect(body.data.proposal.field).toBe("action");
    // logs an AiSession with mode "chat"
    expect(prisma.aiSession.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ mode: "chat", inputTokens: 5 }) })
    );
  });

  it("drops a proposal that targets an invalid field", async () => {
    getAiProvider.mockReturnValue({
      chat: vi.fn().mockResolvedValue({
        json: { reply: "ok", proposal: { field: "not_a_field", newValue: "x" } },
        usage: {},
      }),
    });
    const res = await CHAT(makeRequest({ messages: [{ role: "user", content: "?" }] }), PARAMS);
    const body = await res.json();
    expect(body.data.proposal).toBeNull();
  });

  it("returns 503 when no AI provider is configured", async () => {
    isAiAvailable.mockReturnValue(false);
    const res = await CHAT(makeRequest({ messages: [{ role: "user", content: "?" }] }), PARAMS);
    expect(res.status).toBe(503);
  });

  it("returns 401 when unauthenticated", async () => {
    requireAuth.mockResolvedValue({ session: null, response: errorResponse("AUTH_ERROR", "no", 401) });
    const res = await CHAT(makeRequest({ messages: [{ role: "user", content: "?" }] }), PARAMS);
    expect(res.status).toBe(401);
  });

  it("returns 400 for an empty message list", async () => {
    const res = await CHAT(makeRequest({ messages: [] }), PARAMS);
    expect(res.status).toBe(400);
  });
});

// ── Apply route ──────────────────────────────────────────────────────────────

describe("POST /chat/apply", () => {
  beforeEach(() => {
    prisma.artifactVersion.findFirst.mockResolvedValue({ version: 1 });
    prisma.artifact.update.mockResolvedValue({
      id: "a-1",
      title: "Login",
      status: "DRAFT",
      fields: JSON.stringify({ ...FIELDS, action: "schneller einloggen" }),
    });
  });

  it("applies a field change and records an AI_CHAT version", async () => {
    const res = await APPLY(
      makeRequest({ field: "action", newValue: "schneller einloggen", rationale: "klarer" }),
      PARAMS
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.fields.action).toBe("schneller einloggen");

    // the new version carries source = AI_CHAT + the rationale note
    const updateArg = prisma.artifact.update.mock.calls[0][0];
    expect(updateArg.data.versions.create.source).toBe("AI_CHAT");
    expect(updateArg.data.versions.create.note).toBe("klarer");
  });

  it("rejects an unknown field with 400", async () => {
    const res = await APPLY(makeRequest({ field: "bogus", newValue: "x" }), PARAMS);
    expect(res.status).toBe(400);
    expect(prisma.artifact.update).not.toHaveBeenCalled();
  });

  it("returns 403 when the caller lacks EDITOR access", async () => {
    requireProjectAccess.mockResolvedValue({
      membership: null,
      response: errorResponse("FORBIDDEN", "no", 403),
    });
    const res = await APPLY(makeRequest({ field: "action", newValue: "x" }), PARAMS);
    expect(res.status).toBe(403);
  });
});
