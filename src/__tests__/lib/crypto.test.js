import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { encryptSecret, decryptSecret } from "@/lib/crypto.js";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = "test-secret-for-crypto";
  delete process.env.CONFIG_SECRET;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("encryptSecret / decryptSecret", () => {
  it("round-trips a value", () => {
    const encrypted = encryptSecret("sk-ant-api-key-12345");
    expect(encrypted).toMatch(/^enc:v1:/);
    expect(encrypted).not.toContain("sk-ant");
    expect(decryptSecret(encrypted)).toBe("sk-ant-api-key-12345");
  });

  it("produces different ciphertexts for the same value (random IV)", () => {
    expect(encryptSecret("same")).not.toBe(encryptSecret("same"));
  });

  it("returns empty string for empty input", () => {
    expect(encryptSecret("")).toBe("");
    expect(decryptSecret("")).toBe("");
  });

  it("passes through legacy plaintext values unchanged", () => {
    expect(decryptSecret("sk-legacy-plaintext-key")).toBe("sk-legacy-plaintext-key");
  });

  it("returns empty string when decrypting with the wrong key", () => {
    const encrypted = encryptSecret("secret-value");
    process.env.NEXTAUTH_SECRET = "a-different-secret";
    expect(decryptSecret(encrypted)).toBe("");
  });

  it("returns empty string for corrupted ciphertext", () => {
    expect(decryptSecret("enc:v1:not-valid-base64!!!")).toBe("");
  });

  it("prefers CONFIG_SECRET over NEXTAUTH_SECRET", () => {
    process.env.CONFIG_SECRET = "dedicated-config-secret";
    const encrypted = encryptSecret("value");
    expect(decryptSecret(encrypted)).toBe("value");

    delete process.env.CONFIG_SECRET;
    // Falls back to NEXTAUTH_SECRET, which is a different key → unset
    expect(decryptSecret(encrypted)).toBe("");
  });

  it("throws when no secret is configured", () => {
    delete process.env.NEXTAUTH_SECRET;
    expect(() => encryptSecret("x")).toThrow(/must be set/i);
  });
});
