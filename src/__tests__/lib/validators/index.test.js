import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validateBody, validateParams } from "@/lib/validators/index.js";

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().optional(),
});

describe("validateBody", () => {
  it("returns parsed data when JSON and schema are valid", async () => {
    const req = { json: async () => ({ name: "Alice" }) };
    const { data, response } = await validateBody(req, testSchema);
    expect(response).toBeNull();
    expect(data).toEqual({ name: "Alice" });
  });

  it("returns 400 response when request.json throws", async () => {
    const req = { json: async () => { throw new Error("bad json"); } };
    const { data, response } = await validateBody(req, testSchema);
    expect(data).toBeNull();
    expect(response.status).toBe(400);
    expect(response.data.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 with fieldErrors when schema validation fails", async () => {
    const req = { json: async () => ({ name: "" }) };
    const { data, response } = await validateBody(req, testSchema);
    expect(data).toBeNull();
    expect(response.status).toBe(400);
    expect(response.data.error.details).toBeDefined();
  });

  it("returns 400 when required field is missing", async () => {
    const req = { json: async () => ({ age: 30 }) };
    const { data, response } = await validateBody(req, testSchema);
    expect(data).toBeNull();
    expect(response.status).toBe(400);
  });
});

describe("validateParams", () => {
  const paramSchema = z.object({
    q: z.string().min(1),
    page: z.string().optional(),
  });

  it("returns parsed data for valid params", () => {
    const searchParams = new URLSearchParams({ q: "search term" });
    const { data, response } = validateParams(searchParams, paramSchema);
    expect(response).toBeNull();
    expect(data.q).toBe("search term");
  });

  it("returns 400 for invalid params", () => {
    const searchParams = new URLSearchParams({ q: "" });
    const { data, response } = validateParams(searchParams, paramSchema);
    expect(data).toBeNull();
    expect(response.status).toBe(400);
    expect(response.data.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when required param is missing", () => {
    const searchParams = new URLSearchParams({});
    const { data, response } = validateParams(searchParams, paramSchema);
    expect(data).toBeNull();
    expect(response.status).toBe(400);
  });
});
