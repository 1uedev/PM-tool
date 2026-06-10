import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "@/lib/validators/auth.js";

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      name: "User",
    });
    expect(result.success).toBe(true);
  });

  it("normalizes email to lowercase and trims whitespace", () => {
    const result = registerSchema.safeParse({
      email: "  User@Example.COM ",
      password: "password123",
    });
    expect(result.success).toBe(true);
    expect(result.data.email).toBe("user@example.com");
  });

  it("rejects invalid emails and short passwords", () => {
    expect(registerSchema.safeParse({ email: "nope", password: "password123" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires email and password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});
