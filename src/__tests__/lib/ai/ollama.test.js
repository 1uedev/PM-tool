import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { normalizeBaseUrl, listOllamaModels, OllamaAdapter } from "@/lib/ai/ollama-adapter.js";
import { isAiAvailable, getAiProvider } from "@/lib/ai/provider-factory.js";

describe("normalizeBaseUrl", () => {
  it("defaults to localhost:11434 when empty", () => {
    expect(normalizeBaseUrl("")).toBe("http://localhost:11434");
    expect(normalizeBaseUrl(undefined)).toBe("http://localhost:11434");
  });

  it("strips trailing slashes", () => {
    expect(normalizeBaseUrl("http://host:11434/")).toBe("http://host:11434");
    expect(normalizeBaseUrl("http://host:11434///")).toBe("http://host:11434");
  });
});

describe("listOllamaModels", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses the /api/tags response into { name, size }", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [
          { name: "llama3.2:latest", size: 2_000_000_000 },
          { name: "qwen2.5:7b", size: 4_700_000_000 },
        ],
      }),
    });
    const models = await listOllamaModels("http://localhost:11434");
    expect(models).toEqual([
      { name: "llama3.2:latest", size: 2_000_000_000 },
      { name: "qwen2.5:7b", size: 4_700_000_000 },
    ]);
    // Calls the native tags endpoint on the normalized base URL
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:11434/api/tags",
      expect.objectContaining({ signal: expect.anything() })
    );
  });

  it("falls back to the model field and drops entries without a name", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ models: [{ model: "mistral:latest" }, { foo: "bar" }] }),
    });
    const models = await listOllamaModels("http://localhost:11434");
    expect(models).toEqual([{ name: "mistral:latest", size: null }]);
  });

  it("throws on a non-OK response", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    await expect(listOllamaModels("http://localhost:11434")).rejects.toThrow(/HTTP 500/);
  });
});

describe("provider factory — ollama", () => {
  it("isAiAvailable is true for ollama with a base URL and no key", () => {
    expect(isAiAvailable({ provider: "ollama", baseUrl: "http://localhost:11434", apiKey: "" })).toBe(true);
  });

  it("isAiAvailable is false for ollama without a base URL", () => {
    expect(isAiAvailable({ provider: "ollama", baseUrl: "", apiKey: "" })).toBe(false);
  });

  it("cloud providers still require an API key", () => {
    expect(isAiAvailable({ provider: "openai", apiKey: "" })).toBe(false);
    expect(isAiAvailable({ provider: "openai", apiKey: "sk-x" })).toBe(true);
  });

  it("getAiProvider returns an OllamaAdapter for ollama", () => {
    const adapter = getAiProvider({ provider: "ollama", baseUrl: "http://localhost:11434", model: "llama3.2" });
    expect(adapter).toBeInstanceOf(OllamaAdapter);
    expect(adapter.baseUrl).toBe("http://localhost:11434");
    expect(adapter.model).toBe("llama3.2");
  });
});
