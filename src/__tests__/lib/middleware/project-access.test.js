import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma.js", () => ({
  default: {
    projectMember: { findUnique: vi.fn() },
    artifact: { findFirst: vi.fn() },
  },
}));

import prisma from "@/lib/prisma.js";
import {
  requireProjectAccess,
  requireArtifactAccess,
} from "@/lib/middleware/project-access.js";

const ACTIVE_PROJECT = { id: "proj-1", status: "ACTIVE" };
const ARCHIVED_PROJECT = { id: "proj-1", status: "ARCHIVED" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireProjectAccess", () => {
  it("returns membership when user has sufficient role", async () => {
    prisma.projectMember.findUnique.mockResolvedValue({
      role: "EDITOR",
      project: ACTIVE_PROJECT,
    });
    const { membership, response } = await requireProjectAccess("user-1", "proj-1", "EDITOR");
    expect(response).toBeNull();
    expect(membership.role).toBe("EDITOR");
  });

  it("returns 403 when user is not a member", async () => {
    prisma.projectMember.findUnique.mockResolvedValue(null);
    const { membership, response } = await requireProjectAccess("user-1", "proj-1", "VIEWER");
    expect(membership).toBeNull();
    expect(response.status).toBe(403);
    expect(response.data.error.code).toBe("FORBIDDEN");
  });

  it("returns 403 when user role is below required", async () => {
    prisma.projectMember.findUnique.mockResolvedValue({
      role: "VIEWER",
      project: ACTIVE_PROJECT,
    });
    const { membership, response } = await requireProjectAccess("user-1", "proj-1", "EDITOR");
    expect(membership).toBeNull();
    expect(response.status).toBe(403);
  });

  it("allows OWNER to perform OWNER-only actions", async () => {
    prisma.projectMember.findUnique.mockResolvedValue({
      role: "OWNER",
      project: ACTIVE_PROJECT,
    });
    const { membership, response } = await requireProjectAccess("user-1", "proj-1", "OWNER");
    expect(response).toBeNull();
    expect(membership.role).toBe("OWNER");
  });

  it("allows VIEWER read access on archived project", async () => {
    prisma.projectMember.findUnique.mockResolvedValue({
      role: "VIEWER",
      project: ARCHIVED_PROJECT,
    });
    const { membership, response } = await requireProjectAccess("user-1", "proj-1", "VIEWER");
    expect(response).toBeNull();
    expect(membership).not.toBeNull();
  });

  it("blocks EDITOR write access on archived project", async () => {
    prisma.projectMember.findUnique.mockResolvedValue({
      role: "EDITOR",
      project: ARCHIVED_PROJECT,
    });
    const { membership, response } = await requireProjectAccess("user-1", "proj-1", "EDITOR");
    expect(membership).toBeNull();
    expect(response.status).toBe(403);
  });

  it("role hierarchy: OWNER passes EDITOR requirement", async () => {
    prisma.projectMember.findUnique.mockResolvedValue({
      role: "OWNER",
      project: ACTIVE_PROJECT,
    });
    const { response } = await requireProjectAccess("user-1", "proj-1", "EDITOR");
    expect(response).toBeNull();
  });

  it("role hierarchy: EDITOR passes VIEWER requirement", async () => {
    prisma.projectMember.findUnique.mockResolvedValue({
      role: "EDITOR",
      project: ACTIVE_PROJECT,
    });
    const { response } = await requireProjectAccess("user-1", "proj-1", "VIEWER");
    expect(response).toBeNull();
  });
});

describe("requireArtifactAccess", () => {
  it("returns artifact when it belongs to the project", async () => {
    const artifact = { id: "art-1", projectId: "proj-1", deleted: false };
    prisma.artifact.findFirst.mockResolvedValue(artifact);
    const { artifact: result, response } = await requireArtifactAccess("art-1", "proj-1");
    expect(response).toBeNull();
    expect(result.id).toBe("art-1");
  });

  it("returns 404 when artifact is not found", async () => {
    prisma.artifact.findFirst.mockResolvedValue(null);
    const { artifact, response } = await requireArtifactAccess("art-1", "proj-1");
    expect(artifact).toBeNull();
    expect(response.status).toBe(404);
    expect(response.data.error.code).toBe("NOT_FOUND");
  });

  it("queries with deleted:false to exclude soft-deleted artifacts", async () => {
    prisma.artifact.findFirst.mockResolvedValue(null);
    await requireArtifactAccess("art-deleted", "proj-1");
    expect(prisma.artifact.findFirst).toHaveBeenCalledWith({
      where: { id: "art-deleted", projectId: "proj-1", deleted: false },
    });
  });
});
