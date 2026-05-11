import { describe, it, expect } from "vitest";
import { createRelationSchema } from "@/lib/validators/relation.js";

describe("createRelationSchema", () => {
  it("accepts a valid relation", () => {
    const result = createRelationSchema.safeParse({
      targetId: "artifact-abc",
      type: "DERIVES_FROM",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid relation types", () => {
    for (const type of ["DERIVES_FROM", "DEPENDS_ON", "RELATES_TO", "VALIDATES"]) {
      const result = createRelationSchema.safeParse({ targetId: "xyz", type });
      expect(result.success, `relation type ${type} should be valid`).toBe(true);
    }
  });

  it("rejects a missing targetId", () => {
    const result = createRelationSchema.safeParse({ type: "RELATES_TO" });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.targetId).toBeDefined();
  });

  it("rejects an empty targetId", () => {
    const result = createRelationSchema.safeParse({ targetId: "", type: "RELATES_TO" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid relation type", () => {
    const result = createRelationSchema.safeParse({
      targetId: "abc",
      type: "BLOCKS",
    });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.type).toBeDefined();
  });

  it("rejects a missing type", () => {
    const result = createRelationSchema.safeParse({ targetId: "abc" });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.type).toBeDefined();
  });
});
