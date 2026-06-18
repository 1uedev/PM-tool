import { describe, it, expect } from "vitest";
import { buildChatSystemPrompt, parseChatResult, CHAT_RESULT_SCHEMA } from "@/lib/ai/chat.js";
import { buildRelatedContext, ARTIFACT_CONTEXT_INCLUDE } from "@/lib/ai/artifact-context.js";

const FIELD_DEFS = [
  { key: "role", label: "Als (Rolle)" },
  { key: "action", label: "möchte ich (Aktion)" },
  { key: "benefit", label: "damit (Nutzen)" },
];

describe("buildChatSystemPrompt", () => {
  const base = {
    artifact: { type: "USER_STORY", title: "Login", fields: { role: "Admin", action: "einloggen", benefit: "Zugriff" } },
    fieldDefs: FIELD_DEFS,
    originalPrompt: "GENERIERUNGS-PROMPT-XYZ",
    context: "[PRODUCT_VISION] Vision: schnell",
    origin: "suggest",
    language: "de",
  };

  it("grounds the prompt in the actual content, original prompt and context", () => {
    const p = buildChatSystemPrompt(base);
    expect(p).toContain("USER_STORY");
    expect(p).toContain("Login");
    expect(p).toContain("Admin"); // a current field value
    expect(p).toContain("GENERIERUNGS-PROMPT-XYZ");
    expect(p).toContain("[PRODUCT_VISION] Vision: schnell");
  });

  it("lists the valid field keys plus title", () => {
    const p = buildChatSystemPrompt(base);
    expect(p).toContain("role, action, benefit, title");
  });

  it("names the origin and the target language", () => {
    expect(buildChatSystemPrompt(base)).toContain("KI-Vorschlagsfunktion");
    expect(buildChatSystemPrompt({ ...base, language: "en" })).toContain("Englisch");
  });

  it("handles unknown origin and missing optional sections gracefully", () => {
    const p = buildChatSystemPrompt({ ...base, origin: null, originalPrompt: "", context: "" });
    expect(p).toContain("KI-generierte Inhalte");
    expect(p).not.toContain("URSPRÜNGLICHER GENERIERUNGS-PROMPT");
    expect(p).not.toContain("VERKNÜPFTER PROJEKTKONTEXT");
  });
});

describe("parseChatResult", () => {
  const valid = ["role", "action", "benefit"];

  it("returns reply and a valid proposal", () => {
    const r = parseChatResult(
      { reply: "Hier ist eine Idee.", proposal: { field: "action", newValue: "schneller einloggen", rationale: "klarer" } },
      valid
    );
    expect(r.reply).toBe("Hier ist eine Idee.");
    expect(r.proposal).toEqual({ field: "action", newValue: "schneller einloggen", rationale: "klarer" });
  });

  it("accepts a title proposal", () => {
    const r = parseChatResult({ reply: "x", proposal: { field: "title", newValue: "Neuer Titel" } }, valid);
    expect(r.proposal.field).toBe("title");
    expect(r.proposal.rationale).toBe("");
  });

  it("drops a proposal with an unknown field", () => {
    const r = parseChatResult({ reply: "x", proposal: { field: "nope", newValue: "y" } }, valid);
    expect(r.proposal).toBeNull();
  });

  it("drops a proposal with an empty newValue", () => {
    const r = parseChatResult({ reply: "x", proposal: { field: "role", newValue: "" } }, valid);
    expect(r.proposal).toBeNull();
  });

  it("returns null proposal when none is provided", () => {
    const r = parseChatResult({ reply: "nur Erklärung", proposal: null }, valid);
    expect(r.proposal).toBeNull();
    expect(r.reply).toBe("nur Erklärung");
  });

  it("never throws on malformed input", () => {
    expect(parseChatResult(null, valid)).toEqual({ reply: "", proposal: null });
    expect(parseChatResult("nope", valid)).toEqual({ reply: "", proposal: null });
    expect(parseChatResult({}, valid).reply).toBe("");
  });

  it("caps title proposals at 200 chars and field proposals at 4000", () => {
    const longTitle = "x".repeat(300);
    const r = parseChatResult({ reply: "x", proposal: { field: "title", newValue: longTitle } }, valid);
    expect(r.proposal.newValue).toHaveLength(200);
  });
});

describe("CHAT_RESULT_SCHEMA", () => {
  it("requires reply and allows a nullable proposal object", () => {
    expect(CHAT_RESULT_SCHEMA.required).toContain("reply");
    expect(CHAT_RESULT_SCHEMA.properties.proposal.type).toContain("null");
  });
});

describe("buildRelatedContext", () => {
  it("includes both relation directions and caps length", () => {
    const artifact = {
      relationsFrom: [{ target: { type: "FEATURE", title: "Suche", fields: JSON.stringify({ description: "Volltext" }) } }],
      relationsTo: [{ source: { type: "PRODUCT_VISION", title: "Vision", fields: { oneLiner: "schnell" } } }],
    };
    const ctx = buildRelatedContext(artifact);
    expect(ctx).toContain("[FEATURE] Suche: Volltext");
    expect(ctx).toContain("[PRODUCT_VISION] Vision: schnell");
  });

  it("returns empty string when there are no relations", () => {
    expect(buildRelatedContext({ relationsFrom: [], relationsTo: [] })).toBe("");
    expect(buildRelatedContext({})).toBe("");
  });

  it("exposes a prisma include for both directions", () => {
    expect(ARTIFACT_CONTEXT_INCLUDE.relationsFrom).toBeDefined();
    expect(ARTIFACT_CONTEXT_INCLUDE.relationsTo).toBeDefined();
  });
});
