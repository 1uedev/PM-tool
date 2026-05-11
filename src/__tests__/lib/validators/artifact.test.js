import { describe, it, expect } from "vitest";
import { createArtifactSchema, updateArtifactSchema } from "@/lib/validators/artifact.js";

describe("createArtifactSchema", () => {
  it("accepts a valid artifact", () => {
    const result = createArtifactSchema.safeParse({
      type: "USER_PERSONA",
      title: "Busy Parent Persona",
    });
    expect(result.success).toBe(true);
    expect(result.data.status).toBe("DRAFT"); // default
    expect(result.data.fields).toEqual({});   // default
  });

  it("accepts an artifact with all optional fields", () => {
    const result = createArtifactSchema.safeParse({
      type: "FEATURE",
      title: "Dark mode",
      status: "IN_REVIEW",
      fields: { description: "...", priority: "HIGH" },
    });
    expect(result.success).toBe(true);
    expect(result.data.status).toBe("IN_REVIEW");
  });

  it("rejects a missing type", () => {
    const result = createArtifactSchema.safeParse({ title: "No type" });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.type).toBeDefined();
  });

  it("rejects an invalid type", () => {
    const result = createArtifactSchema.safeParse({ type: "INVALID_TYPE", title: "X" });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.type).toBeDefined();
  });

  it("rejects an empty title", () => {
    const result = createArtifactSchema.safeParse({ type: "USER_PERSONA", title: "" });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.title).toBeDefined();
  });

  it("rejects a title exceeding 200 chars", () => {
    const result = createArtifactSchema.safeParse({
      type: "USER_PERSONA",
      title: "x".repeat(201),
    });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.title).toBeDefined();
  });

  it("rejects an invalid status", () => {
    const result = createArtifactSchema.safeParse({
      type: "USER_PERSONA",
      title: "Test",
      status: "PUBLISHED",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid artifact types", () => {
    const types = ["USER_PERSONA", "PROBLEM_HYPOTHESIS", "PRODUCT_VISION", "USE_CASE", "USER_STORY", "FUNCTIONAL_REQUIREMENT", "FEATURE", "EPIC", "RISK"];
    for (const type of types) {
      const result = createArtifactSchema.safeParse({ type, title: "Test" });
      expect(result.success, `type ${type} should be valid`).toBe(true);
    }
  });
});

describe("updateArtifactSchema", () => {
  it("accepts a partial update with only title", () => {
    const result = updateArtifactSchema.safeParse({ title: "New title" });
    expect(result.success).toBe(true);
  });

  it("accepts a partial update with only status", () => {
    const result = updateArtifactSchema.safeParse({ status: "DONE" });
    expect(result.success).toBe(true);
  });

  it("accepts an empty object (no-op update)", () => {
    const result = updateArtifactSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects an empty title string", () => {
    const result = updateArtifactSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status", () => {
    const result = updateArtifactSchema.safeParse({ status: "ARCHIVED" });
    expect(result.success).toBe(false);
  });
});
