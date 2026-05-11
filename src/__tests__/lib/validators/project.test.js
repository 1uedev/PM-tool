import { describe, it, expect } from "vitest";
import { createProjectSchema, updateProjectSchema } from "@/lib/validators/project.js";

describe("createProjectSchema", () => {
  it("accepts a minimal valid project", () => {
    const result = createProjectSchema.safeParse({ name: "My Project" });
    expect(result.success).toBe(true);
  });

  it("accepts a project with optional description", () => {
    const result = createProjectSchema.safeParse({
      name: "My Project",
      description: "A description",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = createProjectSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.name).toBeDefined();
  });

  it("rejects a name exceeding 100 chars", () => {
    const result = createProjectSchema.safeParse({ name: "x".repeat(101) });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.name).toBeDefined();
  });

  it("rejects a description exceeding 500 chars", () => {
    const result = createProjectSchema.safeParse({
      name: "Valid",
      description: "x".repeat(501),
    });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.description).toBeDefined();
  });

  it("accepts a name at exactly the max boundary", () => {
    const result = createProjectSchema.safeParse({ name: "x".repeat(100) });
    expect(result.success).toBe(true);
  });
});

describe("updateProjectSchema", () => {
  it("accepts an empty object", () => {
    const result = updateProjectSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a name-only update", () => {
    const result = updateProjectSchema.safeParse({ name: "Renamed" });
    expect(result.success).toBe(true);
  });

  it("accepts a description-only update", () => {
    const result = updateProjectSchema.safeParse({ description: "New desc" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name when name is provided", () => {
    const result = updateProjectSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});
