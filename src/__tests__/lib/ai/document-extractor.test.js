import { describe, it, expect } from "vitest";
import {
  parseExtractionResponse,
  buildExtractionPrompt,
} from "@/lib/ai/document-extractor.js";

// ─── parseExtractionResponse ───────────────────────────────────────────────

describe("parseExtractionResponse", () => {
  it("parses a valid JSON code block", () => {
    const text = `\`\`\`json
[
  {
    "type": "PRODUCT_VISION",
    "title": "My product vision",
    "fields": {
      "oneLiner": "AI-powered PM tool",
      "targetUsers": "Product managers",
      "valueProposition": "Structured PRDs"
    }
  }
]
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("PRODUCT_VISION");
    expect(result[0].title).toBe("My product vision");
    expect(result[0].fields.oneLiner).toBe("AI-powered PM tool");
  });

  it("parses a code block without the 'json' language hint", () => {
    const text = "```\n[{\"type\":\"FEATURE\",\"title\":\"Dark mode\",\"fields\":{\"description\":\"Adds dark theme\",\"userValue\":\"\",\"inScope\":\"\",\"outOfScope\":\"\",\"priority\":\"\"}}]\n```";
    const result = parseExtractionResponse(text);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("FEATURE");
  });

  it("filters out artifacts with unsupported types", () => {
    const text = "```json\n[{\"type\":\"INVALID_TYPE\",\"title\":\"X\",\"fields\":{}}]\n```";
    const result = parseExtractionResponse(text);
    expect(result).toHaveLength(0);
  });

  it("filters out artifacts with empty or missing title", () => {
    const text = `\`\`\`json
[
  {"type":"FEATURE","title":"","fields":{"description":""}},
  {"type":"FEATURE","title":"   ","fields":{"description":""}}
]
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result).toHaveLength(0);
  });

  it("strips extra unknown fields from fields object", () => {
    const text = `\`\`\`json
[{"type":"PRODUCT_VISION","title":"Vision","fields":{"oneLiner":"X","extraField":"ignored","targetUsers":"PMs","valueProposition":""}}]
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result[0].fields.extraField).toBeUndefined();
    expect(result[0].fields.oneLiner).toBe("X");
  });

  it("fills missing fields with empty string", () => {
    const text = `\`\`\`json
[{"type":"PRODUCT_VISION","title":"Vision","fields":{}}]
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result[0].fields.oneLiner).toBe("");
    expect(result[0].fields.targetUsers).toBe("");
    expect(result[0].fields.valueProposition).toBe("");
  });

  it("caps title at 80 characters", () => {
    const longTitle = "x".repeat(100);
    const text = `\`\`\`json\n[{"type":"FEATURE","title":"${longTitle}","fields":{}}]\n\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result[0].title).toHaveLength(80);
  });

  it("trims leading/trailing whitespace from title", () => {
    const text = `\`\`\`json\n[{"type":"FEATURE","title":"  Dark mode  ","fields":{}}]\n\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result[0].title).toBe("Dark mode");
  });

  it("returns empty array for completely invalid JSON", () => {
    const result = parseExtractionResponse("not json at all");
    expect(result).toEqual([]);
  });

  it("returns empty array when JSON is not an array", () => {
    const result = parseExtractionResponse("```json\n{\"type\":\"FEATURE\"}\n```");
    expect(result).toEqual([]);
  });

  it("returns empty array for empty array input", () => {
    const result = parseExtractionResponse("```json\n[]\n```");
    expect(result).toEqual([]);
  });

  it("handles multiple valid artifacts", () => {
    const text = `\`\`\`json
[
  {"type":"PRODUCT_VISION","title":"Vision","fields":{"oneLiner":"X","targetUsers":"","valueProposition":""}},
  {"type":"USER_PERSONA","title":"Alice","fields":{"name":"Alice","goals":"","painPoints":"","context":""}}
]
\`\`\``;
    const result = parseExtractionResponse(text);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("PRODUCT_VISION");
    expect(result[1].type).toBe("USER_PERSONA");
  });
});

// ─── buildExtractionPrompt ─────────────────────────────────────────────────

describe("buildExtractionPrompt", () => {
  it("includes the document text in the prompt", () => {
    const prompt = buildExtractionPrompt("This is a PRD document.");
    expect(prompt).toContain("This is a PRD document.");
  });

  it("includes all supported artifact types", () => {
    const prompt = buildExtractionPrompt("text");
    for (const type of [
      "PRODUCT_VISION",
      "PROBLEM_STATEMENT",
      "USER_PERSONA",
      "FEATURE",
      "KPI_OKR",
    ]) {
      expect(prompt).toContain(type);
    }
  });

  it("truncates document text at 20000 characters", () => {
    const longText = "x".repeat(30000);
    const prompt = buildExtractionPrompt(longText);
    // The truncated text portion should not contain content beyond 20000 chars
    const textSection = prompt.split("DOCUMENT CONTENT:")[1];
    expect(textSection.trim()).toHaveLength(20000);
  });

  it("instructs the AI to return a JSON array in a code block", () => {
    const prompt = buildExtractionPrompt("text");
    expect(prompt).toContain("```json");
    expect(prompt).toContain("JSON array");
  });
});
