import { describe, it, expect } from "vitest";
import { errorResponse, successResponse } from "@/lib/errors.js";

describe("errorResponse", () => {
  it("returns correct error shape and status", () => {
    const res = errorResponse("AUTH_ERROR", "Not authenticated", 401);
    expect(res.status).toBe(401);
    expect(res.data.error.code).toBe("AUTH_ERROR");
    expect(res.data.error.message).toBe("Not authenticated");
    expect(res.data.error.details).toBeUndefined();
  });

  it("includes details when provided", () => {
    const details = { email: ["Invalid email"] };
    const res = errorResponse("VALIDATION_ERROR", "Bad input", 400, details);
    expect(res.status).toBe(400);
    expect(res.data.error.details).toEqual(details);
  });

  it("omits details key when not provided", () => {
    const res = errorResponse("NOT_FOUND", "Not found", 404);
    expect("details" in res.data.error).toBe(false);
  });

  it("does not expose a data key at top level on errors", () => {
    const res = errorResponse("SERVER_ERROR", "Oops", 500);
    expect(res.data.data).toBeUndefined();
  });
});

describe("successResponse", () => {
  it("wraps payload in data key with status 200 by default", () => {
    const res = successResponse({ id: "abc" });
    expect(res.status).toBe(200);
    expect(res.data.data).toEqual({ id: "abc" });
  });

  it("accepts a custom status", () => {
    const res = successResponse({ id: "xyz" }, 201);
    expect(res.status).toBe(201);
  });

  it("wraps arrays correctly", () => {
    const res = successResponse([1, 2, 3]);
    expect(res.data.data).toEqual([1, 2, 3]);
  });

  it("does not expose an error key on success", () => {
    const res = successResponse({ ok: true });
    expect(res.data.error).toBeUndefined();
  });
});
