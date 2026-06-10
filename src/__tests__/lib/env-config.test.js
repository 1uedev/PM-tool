import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs", () => ({
  default: {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

import fs from "fs";
import { validateDatabaseUrl, writeEnvLocal, detectDbType } from "@/lib/env-config.js";

beforeEach(() => {
  vi.clearAllMocks();
  fs.readFileSync.mockImplementation(() => {
    throw new Error("ENOENT");
  });
});

describe("validateDatabaseUrl", () => {
  it("accepts a sqlite file URL", () => {
    expect(validateDatabaseUrl("file:./dev.db")).toEqual({ ok: true, type: "sqlite" });
    expect(validateDatabaseUrl("file:./prisma/dev.db").ok).toBe(true);
  });

  it("accepts postgres and mysql connection URLs (incl. hyphens)", () => {
    expect(validateDatabaseUrl("postgresql://user:pa-ss@db-host:5432/my-db")).toEqual({
      ok: true,
      type: "postgresql",
    });
    expect(validateDatabaseUrl("mysql://u:p@host:3306/db")).toEqual({ ok: true, type: "mariadb" });
  });

  it("rejects empty / missing URLs", () => {
    expect(validateDatabaseUrl("").ok).toBe(false);
    expect(validateDatabaseUrl(null).ok).toBe(false);
    expect(validateDatabaseUrl("   ").ok).toBe(false);
  });

  it("rejects URLs containing quotes or newlines (env injection)", () => {
    expect(validateDatabaseUrl('file:./x"\nNEXTAUTH_SECRET="evil').ok).toBe(false);
    expect(validateDatabaseUrl("postgresql://u:p'@h/db").ok).toBe(false);
    expect(validateDatabaseUrl("file:./a b.db").ok).toBe(false);
  });

  it("rejects random strings that are not file: URLs", () => {
    expect(validateDatabaseUrl("not-a-url").ok).toBe(false);
    expect(validateDatabaseUrl("sqlite.db").ok).toBe(false);
  });

  it("rejects overlong URLs", () => {
    expect(validateDatabaseUrl("postgresql://" + "a".repeat(500)).ok).toBe(false);
  });

  it("rejects connection URLs without a host", () => {
    expect(validateDatabaseUrl("postgresql://").ok).toBe(false);
  });
});

describe("writeEnvLocal", () => {
  it("writes quoted key=value pairs", () => {
    writeEnvLocal({ DATABASE_URL: "file:./dev.db" });
    expect(fs.writeFileSync).toHaveBeenCalledOnce();
    const content = fs.writeFileSync.mock.calls[0][1];
    expect(content).toBe('DATABASE_URL="file:./dev.db"\n');
  });

  it("throws on values containing quotes or newlines instead of writing them", () => {
    expect(() => writeEnvLocal({ DATABASE_URL: 'x"\nNEXTAUTH_SECRET="evil' })).toThrow(/unsafe env value/i);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("throws on suspicious keys", () => {
    expect(() => writeEnvLocal({ "BAD KEY": "x" })).toThrow(/unsafe env key/i);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});

describe("detectDbType", () => {
  it("maps URL schemes to db types", () => {
    expect(detectDbType("postgresql://x")).toBe("postgresql");
    expect(detectDbType("postgres://x")).toBe("postgresql");
    expect(detectDbType("mysql://x")).toBe("mariadb");
    expect(detectDbType("file:./dev.db")).toBe("sqlite");
  });
});
