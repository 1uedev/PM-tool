import { describe, it, expect } from "vitest";
import {
  parseExtractionResponse,
  buildExtractionPrompt,
  getCanonicalExtractableTypes,
  buildTypeSchemas,
  mergeExtractionResults,
  chunkText,
} from "@/lib/ai/document-extractor.js";
import { ARTIFACT_FIELD_DEFS } from "@/lib/artifactFields.js";
import { ARTIFACT_TYPE_ORDER, RELATION_TYPE } from "@/lib/constants.js";

// ─── getCanonicalExtractableTypes / buildTypeSchemas ───────────────────────

describe("getCanonicalExtractableTypes", () => {
  it("returns every canonical type that has a field schema", () => {
    const types = getCanonicalExtractableTypes();
    expect(types.length).toBeGreaterThan(13); // must move beyond the old 13-type cap
    // Every returned type has a field schema.
    for (const t of types) {
      expect(Array.isArray(ARTIFACT_FIELD_DEFS[t])).toBe(true);
    }
    // No canonical type with a schema is missing.
    for (const t of ARTIFACT_TYPE_ORDER) {
      if (Array.isArray(ARTIFACT_FIELD_DEFS[t])) {
        expect(types).toContain(t);
      }
    }
  });
});

describe("buildTypeSchemas", () => {
  it("includes all canonical extractable types with field definitions", () => {
    const schemas = buildTypeSchemas();
    const types = getCanonicalExtractableTypes();
    expect(Object.keys(schemas).sort()).toEqual([...types].sort());
    for (const t of types) {
      expect(schemas[t].fieldKeys.length).toBeGreaterThan(0);
      expect(schemas[t].fields.every((f) => typeof f.key === "string")).toBe(true);
      expect(schemas[t].fields.every((f) => typeof f.label === "string")).toBe(true);
    }
  });

  it("does not contain a hard-coded 13-type limit", () => {
    const schemas = buildTypeSchemas();
    expect(Object.keys(schemas).length).toBeGreaterThan(13);
  });
});

// ─── parseExtractionResponse ───────────────────────────────────────────────

describe("parseExtractionResponse", () => {
  it("parses a strict object response with artifacts and relations", () => {
    const text = `\`\`\`json
{
  "artifacts": [
    {
      "clientId": "a1",
      "type": "PRODUCT_VISION",
      "title": "My product vision",
      "fields": { "oneLiner": "AI-powered PM tool" },
      "confidence": 0.9,
      "inferred": false,
      "evidence": [{ "fileName": "spec.pdf", "quote": "We build PM tools." }],
      "rationale": "Stated in document"
    },
    {
      "clientId": "a2",
      "type": "FEATURE",
      "title": "Dark mode",
      "fields": { "description": "Adds dark theme" },
      "confidence": 0.75
    }
  ],
  "relations": [
    { "sourceClientId": "a2", "targetClientId": "a1", "type": "DERIVES_FROM", "confidence": 0.7, "rationale": "Feature derives from vision" }
  ]
}
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result.artifacts).toHaveLength(2);
    expect(result.artifacts[0].type).toBe("PRODUCT_VISION");
    expect(result.artifacts[0].fields.oneLiner).toBe("AI-powered PM tool");
    expect(result.artifacts[0].evidence).toHaveLength(1);
    expect(result.relations).toHaveLength(1);
    expect(result.relations[0].type).toBe("DERIVES_FROM");
  });

  it("parses a code block without the 'json' language hint", () => {
    const text =
      '```\n{"artifacts":[{"type":"FEATURE","title":"Dark mode","fields":{"description":"Adds dark theme"}}],"relations":[]}\n```';
    const result = parseExtractionResponse(text);
    expect(result.artifacts).toHaveLength(1);
    expect(result.artifacts[0].type).toBe("FEATURE");
  });

  it("parses bare JSON without a code block", () => {
    const text =
      '{"artifacts":[{"type":"FEATURE","title":"Search","fields":{}}],"relations":[]}';
    const result = parseExtractionResponse(text);
    expect(result.artifacts).toHaveLength(1);
  });

  it("accepts the legacy bare-array format", () => {
    const text =
      '```json\n[{"type":"FEATURE","title":"Search","fields":{}}]\n```';
    const result = parseExtractionResponse(text);
    expect(result.artifacts).toHaveLength(1);
    expect(result.artifacts[0].type).toBe("FEATURE");
    expect(result.relations).toEqual([]);
  });

  it("filters out artifacts with unsupported types", () => {
    const text =
      '```json\n{"artifacts":[{"type":"INVALID_TYPE","title":"X","fields":{}}],"relations":[]}\n```';
    const result = parseExtractionResponse(text);
    expect(result.artifacts).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("filters out artifacts with empty or missing title", () => {
    const text = `\`\`\`json
{"artifacts":[
  {"type":"FEATURE","title":"","fields":{"description":""}},
  {"type":"FEATURE","title":"   ","fields":{"description":""}}
],"relations":[]}
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result.artifacts).toHaveLength(0);
  });

  it("strips unknown field keys", () => {
    const text = `\`\`\`json
{"artifacts":[{"type":"PRODUCT_VISION","title":"Vision","fields":{"oneLiner":"X","extraField":"ignored"}}],"relations":[]}
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result.artifacts[0].fields.extraField).toBeUndefined();
    expect(result.artifacts[0].fields.oneLiner).toBe("X");
  });

  it("fills missing valid fields with empty string", () => {
    const text =
      '```json\n{"artifacts":[{"type":"USER_PERSONA","title":"Alice","fields":{}}],"relations":[]}\n```';
    const result = parseExtractionResponse(text);
    const fieldKeys = ARTIFACT_FIELD_DEFS.USER_PERSONA.map((f) => f.key);
    for (const k of fieldKeys) {
      expect(result.artifacts[0].fields[k]).toBe("");
    }
  });

  it("caps title at 200 characters", () => {
    const longTitle = "x".repeat(300);
    const text = `\`\`\`json\n{"artifacts":[{"type":"FEATURE","title":"${longTitle}","fields":{}}],"relations":[]}\n\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result.artifacts[0].title).toHaveLength(200);
  });

  it("trims whitespace from title", () => {
    const text =
      '```json\n{"artifacts":[{"type":"FEATURE","title":"  Dark mode  ","fields":{}}],"relations":[]}\n```';
    const result = parseExtractionResponse(text);
    expect(result.artifacts[0].title).toBe("Dark mode");
  });

  it("returns empty object for completely invalid JSON", () => {
    const result = parseExtractionResponse("not json at all");
    expect(result.artifacts).toEqual([]);
    expect(result.relations).toEqual([]);
  });

  it("returns empty arrays for missing artifacts/relations keys", () => {
    const result = parseExtractionResponse('```json\n{}\n```');
    expect(result.artifacts).toEqual([]);
    expect(result.relations).toEqual([]);
  });

  it("drops relations referencing unknown clientIds", () => {
    const text = `\`\`\`json
{"artifacts":[{"clientId":"a1","type":"FEATURE","title":"F","fields":{}}],
 "relations":[{"sourceClientId":"a1","targetClientId":"missing","type":"DERIVES_FROM"}]}
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result.relations).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes("missing") || w.includes("unbekannte"))).toBe(true);
  });

  it("drops relations with invalid types", () => {
    const text = `\`\`\`json
{"artifacts":[
  {"clientId":"a1","type":"FEATURE","title":"F","fields":{}},
  {"clientId":"a2","type":"USER_STORY","title":"S","fields":{}}
],
 "relations":[{"sourceClientId":"a1","targetClientId":"a2","type":"NOT_A_REAL_TYPE"}]}
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result.relations).toHaveLength(0);
  });

  it("clamps confidence into [0, 1]", () => {
    const text = `\`\`\`json
{"artifacts":[
  {"type":"FEATURE","title":"A","fields":{},"confidence":1.5},
  {"type":"FEATURE","title":"B","fields":{},"confidence":-0.4}
],"relations":[]}
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result.artifacts[0].confidence).toBe(1);
    expect(result.artifacts[1].confidence).toBe(0);
  });

  it("collapses array field values into strings instead of crashing", () => {
    const text = `\`\`\`json
{"artifacts":[{"type":"FEATURE","title":"F","fields":{"description":["line one","line two"]}}],"relations":[]}
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result.artifacts[0].fields.description).toContain("line one");
    expect(result.artifacts[0].fields.description).toContain("line two");
  });

  it("assigns auto clientIds when missing", () => {
    const text = `\`\`\`json
{"artifacts":[
  {"type":"FEATURE","title":"A","fields":{}},
  {"type":"FEATURE","title":"B","fields":{}}
],"relations":[]}
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result.artifacts[0].clientId).toBeTruthy();
    expect(result.artifacts[1].clientId).toBeTruthy();
    expect(result.artifacts[0].clientId).not.toBe(result.artifacts[1].clientId);
  });

  it("never throws on malformed input", () => {
    expect(() => parseExtractionResponse(undefined)).not.toThrow();
    expect(() => parseExtractionResponse(null)).not.toThrow();
    expect(() => parseExtractionResponse("")).not.toThrow();
    expect(() => parseExtractionResponse("```json\n{ bad")).not.toThrow();
  });
});

// ─── buildExtractionPrompt ─────────────────────────────────────────────────

describe("buildExtractionPrompt", () => {
  it("includes the document text in the prompt (string input)", () => {
    const prompt = buildExtractionPrompt("This is a PRD document.");
    expect(prompt).toContain("This is a PRD document.");
  });

  it("accepts an object input with documentText", () => {
    const prompt = buildExtractionPrompt({ documentText: "hello world" });
    expect(prompt).toContain("hello world");
  });

  it("includes every canonical extractable artifact type", () => {
    const prompt = buildExtractionPrompt("text");
    for (const type of getCanonicalExtractableTypes()) {
      expect(prompt).toContain(type);
    }
  });

  it("does not silently truncate long documents (chunking handles size)", () => {
    const longText = "Y".repeat(30000);
    const prompt = buildExtractionPrompt(longText);
    // Long document text should appear in full when passed directly.
    expect(prompt.indexOf("Y".repeat(30000))).toBeGreaterThan(-1);
  });

  it("mentions chunk position when given chunkIndex/totalChunks", () => {
    const prompt = buildExtractionPrompt({
      documentText: "x",
      chunkIndex: 1,
      totalChunks: 3,
    });
    expect(prompt).toContain("CHUNK 2 VON 3");
  });

  it("lists all relation types in the prompt", () => {
    const prompt = buildExtractionPrompt("text");
    for (const t of Object.values(RELATION_TYPE)) {
      expect(prompt).toContain(t);
    }
  });

  it("instructs the model to return strict JSON in a code block", () => {
    const prompt = buildExtractionPrompt("text");
    expect(prompt).toContain("```json");
    expect(prompt).toContain('"artifacts"');
    expect(prompt).toContain('"relations"');
  });
});

// ─── chunkText ─────────────────────────────────────────────────────────────

describe("chunkText", () => {
  it("returns the input as a single chunk when it fits", () => {
    const chunks = chunkText("short text", { chunkSize: 100, overlap: 10 });
    expect(chunks).toEqual(["short text"]);
  });

  it("splits long text into multiple overlapping chunks", () => {
    const text = "A".repeat(5000);
    const chunks = chunkText(text, { chunkSize: 1000, overlap: 100 });
    expect(chunks.length).toBeGreaterThan(1);
    // Concatenation contains the original text (overlap allows repeats).
    expect(chunks.join("").length).toBeGreaterThanOrEqual(text.length);
  });

  it("returns empty array for empty input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText(undefined)).toEqual([]);
  });
});

// ─── mergeExtractionResults ────────────────────────────────────────────────

describe("mergeExtractionResults", () => {
  it("deduplicates artifacts with identical (type, title) across chunks", () => {
    const r1 = parseExtractionResponse(
      '```json\n{"artifacts":[{"type":"FEATURE","title":"Search","fields":{"description":"v1"}}],"relations":[]}\n```'
    );
    const r2 = parseExtractionResponse(
      '```json\n{"artifacts":[{"type":"FEATURE","title":"Search","fields":{"description":"v2"}}],"relations":[]}\n```'
    );
    const merged = mergeExtractionResults([r1, r2]);
    expect(merged.artifacts).toHaveLength(1);
  });

  it("remaps relation clientIds correctly after merging", () => {
    const r1 = parseExtractionResponse(`\`\`\`json
{"artifacts":[
  {"clientId":"a1","type":"FEATURE","title":"Search","fields":{}},
  {"clientId":"a2","type":"USER_STORY","title":"Find docs","fields":{}}
],"relations":[
  {"sourceClientId":"a2","targetClientId":"a1","type":"DERIVES_FROM"}
]}
\`\`\``);
    const merged = mergeExtractionResults([r1]);
    expect(merged.artifacts).toHaveLength(2);
    expect(merged.relations).toHaveLength(1);
    const srcId = merged.relations[0].sourceClientId;
    const tgtId = merged.relations[0].targetClientId;
    expect(merged.artifacts.some((a) => a.clientId === srcId)).toBe(true);
    expect(merged.artifacts.some((a) => a.clientId === tgtId)).toBe(true);
  });

  it("deduplicates identical relations across chunks", () => {
    const make = () =>
      parseExtractionResponse(`\`\`\`json
{"artifacts":[
  {"clientId":"a1","type":"FEATURE","title":"Search","fields":{}},
  {"clientId":"a2","type":"USER_STORY","title":"Find docs","fields":{}}
],"relations":[
  {"sourceClientId":"a2","targetClientId":"a1","type":"DERIVES_FROM"}
]}
\`\`\``);
    const merged = mergeExtractionResults([make(), make()]);
    expect(merged.relations).toHaveLength(1);
  });
});
