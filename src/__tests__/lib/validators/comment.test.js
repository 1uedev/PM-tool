import { describe, it, expect } from "vitest";
import { createCommentSchema } from "@/lib/validators/comment.js";

describe("createCommentSchema", () => {
  it("accepts a valid comment", () => {
    const result = createCommentSchema.safeParse({ content: "Looks good!" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty string", () => {
    const result = createCommentSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.content).toBeDefined();
  });

  it("rejects missing content", () => {
    const result = createCommentSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects content exceeding 2000 chars", () => {
    const result = createCommentSchema.safeParse({ content: "x".repeat(2001) });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.content).toBeDefined();
  });

  it("accepts content at exactly 2000 chars", () => {
    const result = createCommentSchema.safeParse({ content: "x".repeat(2000) });
    expect(result.success).toBe(true);
  });
});
