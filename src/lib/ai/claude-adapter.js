import Anthropic from "@anthropic-ai/sdk";
import { AiProvider } from "./provider.js";
import { buildPrompt, parseSuggestions, buildSuggestionSchema } from "./prompts/index.js";
import { EXTRACTION_RESULT_SCHEMA } from "./document-extractor.js";
import { AI_DEFAULT_MODELS } from "@/lib/constants.js";

// Normalize Anthropic usage reporting to { inputTokens, outputTokens }
function extractUsage(response) {
  return {
    inputTokens: response?.usage?.input_tokens ?? null,
    outputTokens: response?.usage?.output_tokens ?? null,
  };
}

// Forced tool use guarantees schema-conforming, parseable output — the model
// must "call" the tool, and its input IS the structured result.
function toolFor(schema) {
  return {
    name: "deliver_result",
    description: "Liefert das strukturierte Ergebnis im geforderten Schema.",
    input_schema: schema,
  };
}

function toolInput(response) {
  const block = response.content.find((b) => b.type === "tool_use");
  return block?.input ?? null;
}

export class ClaudeAdapter extends AiProvider {
  constructor(config) {
    super();
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model || AI_DEFAULT_MODELS.claude;
    this.maxTokens = config.maxTokens || 2048;
    this.timeoutMs = config.timeoutMs || 30000;
  }

  async suggest(artifact, context = "") {
    const prompt = buildPrompt(artifact.type, artifact.fields, context, artifact.language);
    const fieldKeys = Object.keys(artifact.fields ?? {});

    const response = await this.client.messages.create(
      {
        model: this.model,
        max_tokens: this.maxTokens,
        tools: [toolFor(buildSuggestionSchema(fieldKeys))],
        tool_choice: { type: "tool", name: "deliver_result" },
        messages: [{ role: "user", content: prompt }],
      },
      { timeout: this.timeoutMs }
    );

    const usage = extractUsage(response);
    const structured = toolInput(response);
    if (structured) {
      // Run through the sanitizer (string coercion) for a uniform shape
      return { ...parseSuggestions(JSON.stringify(structured), artifact.type), usage };
    }
    // Defensive fallback: parse free text if the model answered without the tool
    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    return { ...parseSuggestions(text, artifact.type), usage };
  }

  async extractFromDocument(prompt, { schema = EXTRACTION_RESULT_SCHEMA } = {}) {
    const response = await this.client.messages.create(
      {
        model: this.model,
        max_tokens: 4096,
        tools: [toolFor(schema)],
        tool_choice: { type: "tool", name: "deliver_result" },
        messages: [{ role: "user", content: prompt }],
      },
      { timeout: this.timeoutMs }
    );

    const usage = extractUsage(response);
    const structured = toolInput(response);
    return {
      // Callers feed this into the sanitizing parsers, which expect text
      text: structured
        ? JSON.stringify(structured)
        : response.content.find((b) => b.type === "text")?.text ?? "",
      usage,
    };
  }

  async testConnection() {
    const response = await this.client.messages.create(
      {
        model: this.model,
        max_tokens: 10,
        messages: [{ role: "user", content: "Reply with OK" }],
      },
      { timeout: 10000 }
    );
    return response.content[0]?.text ?? "OK";
  }
}
