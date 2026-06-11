import { describe, it, expect } from "vitest";
import { buildPrompt, buildSuggestionSchema, hasPromptBuilder } from "@/lib/ai/prompts/index.js";

describe("buildPrompt language handling", () => {
  const fields = { role: "", action: "", benefit: "" };

  it("appends no override for German (template default)", () => {
    const prompt = buildPrompt("USER_STORY", fields, "", "de");
    expect(prompt).not.toContain("WICHTIG: Verfasse");
  });

  it("appends a language override for non-German targets", () => {
    const prompt = buildPrompt("USER_STORY", fields, "", "en");
    expect(prompt).toContain("auf Englisch");
    expect(prompt).toContain("überschreibt die Sprachregel");
  });

  it("falls back to the raw code for unknown languages", () => {
    const prompt = buildPrompt("USER_STORY", fields, "", "pt");
    expect(prompt).toContain("auf pt");
  });
});

describe("buildSuggestionSchema", () => {
  it("creates a string property per field key", () => {
    const schema = buildSuggestionSchema(["role", "action", "benefit"]);
    expect(schema.type).toBe("object");
    expect(Object.keys(schema.properties)).toEqual(["role", "action", "benefit"]);
    expect(schema.properties.role).toEqual({ type: "string" });
    expect(schema.additionalProperties).toBe(false);
  });
});

describe("hasPromptBuilder", () => {
  it("knows registered types and rejects unknown ones", () => {
    expect(hasPromptBuilder("USER_STORY")).toBe(true);
    expect(hasPromptBuilder("NOT_A_TYPE")).toBe(false);
  });
});
