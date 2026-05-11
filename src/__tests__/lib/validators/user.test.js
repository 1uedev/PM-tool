import { describe, it, expect } from "vitest";
import {
  createUserSchema,
  updateUserSchema,
  formatUserName,
  safeUser,
} from "@/lib/validators/user.js";

describe("createUserSchema", () => {
  it("accepts a valid user", () => {
    const result = createUserSchema.safeParse({
      email: "alice@example.com",
      password: "securepass",
      firstName: "Alice",
      lastName: "Smith",
    });
    expect(result.success).toBe(true);
    expect(result.data.systemRole).toBe("USER");   // default
    expect(result.data.status).toBe("ACTIVE");     // default
  });

  it("rejects an invalid email", () => {
    const result = createUserSchema.safeParse({
      email: "not-an-email",
      password: "securepass",
      firstName: "Alice",
      lastName: "Smith",
    });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.email).toBeDefined();
  });

  it("rejects a password shorter than 8 chars", () => {
    const result = createUserSchema.safeParse({
      email: "alice@example.com",
      password: "short",
      firstName: "Alice",
      lastName: "Smith",
    });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.password).toBeDefined();
  });

  it("rejects missing firstName", () => {
    const result = createUserSchema.safeParse({
      email: "alice@example.com",
      password: "securepass",
      lastName: "Smith",
    });
    expect(result.success).toBe(false);
  });

  it("accepts systemRole ADMIN", () => {
    const result = createUserSchema.safeParse({
      email: "admin@example.com",
      password: "adminpass1",
      firstName: "Admin",
      lastName: "User",
      systemRole: "ADMIN",
    });
    expect(result.success).toBe(true);
    expect(result.data.systemRole).toBe("ADMIN");
  });

  it("rejects an invalid systemRole", () => {
    const result = createUserSchema.safeParse({
      email: "alice@example.com",
      password: "securepass",
      firstName: "Alice",
      lastName: "Smith",
      systemRole: "SUPERUSER",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateUserSchema", () => {
  it("accepts an empty object", () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a partial update", () => {
    const result = updateUserSchema.safeParse({ firstName: "Bob" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email when provided", () => {
    const result = updateUserSchema.safeParse({ email: "bad-email" });
    expect(result.success).toBe(false);
  });
});

describe("formatUserName", () => {
  it("returns full name when both parts present", () => {
    expect(formatUserName({ firstName: "Alice", lastName: "Smith" })).toBe("Alice Smith");
  });

  it("returns firstName only when lastName missing", () => {
    expect(formatUserName({ firstName: "Alice" })).toBe("Alice");
  });

  it("falls back to name field", () => {
    expect(formatUserName({ name: "Alice S." })).toBe("Alice S.");
  });

  it("falls back to email as last resort", () => {
    expect(formatUserName({ email: "alice@example.com" })).toBe("alice@example.com");
  });
});

describe("safeUser", () => {
  it("strips passwordHash from the object", () => {
    const user = {
      id: "1",
      email: "alice@example.com",
      passwordHash: "hashed",
      firstName: "Alice",
      lastName: "Smith",
    };
    const safe = safeUser(user);
    expect(safe.passwordHash).toBeUndefined();
    expect(safe.email).toBe("alice@example.com");
  });

  it("adds displayName", () => {
    const user = {
      id: "1",
      email: "alice@example.com",
      passwordHash: "hashed",
      firstName: "Alice",
      lastName: "Smith",
    };
    const safe = safeUser(user);
    expect(safe.displayName).toBe("Alice Smith");
  });
});
