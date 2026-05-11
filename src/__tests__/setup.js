import { vi } from "vitest";

// Mock next/server so NextResponse.json returns a plain inspectable object
vi.mock("next/server", () => ({
  NextResponse: {
    json: (data, init) => ({
      data,
      status: init?.status ?? 200,
      async json() { return this.data; },
    }),
  },
}));
