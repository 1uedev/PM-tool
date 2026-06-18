import OpenAI from "openai";
import { AiProvider } from "./provider.js";
import { buildPrompt, parseSuggestions } from "./prompts/index.js";
import { OLLAMA_DEFAULT_BASE_URL } from "@/lib/constants.js";

// Local Ollama via its OpenAI-compatible API (/v1). No API key required;
// the OpenAI SDK still wants one, so we pass a harmless placeholder. Token
// usage is reported in the same shape as OpenAI.

function extractUsage(response) {
  return {
    inputTokens: response?.usage?.prompt_tokens ?? null,
    outputTokens: response?.usage?.completion_tokens ?? null,
  };
}

/** Normalize a base URL: fall back to default, strip trailing slashes. */
export function normalizeBaseUrl(baseUrl) {
  return (baseUrl || OLLAMA_DEFAULT_BASE_URL).replace(/\/+$/, "");
}

/**
 * Lists locally installed Ollama models via the native /api/tags endpoint.
 * Returns [{ name, size }]. Throws on connection/timeout errors.
 */
export async function listOllamaModels(baseUrl, { timeoutMs = 5000 } = {}) {
  const url = `${normalizeBaseUrl(baseUrl)}/api/tags`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Ollama antwortete mit HTTP ${res.status}`);
    const data = await res.json();
    const models = Array.isArray(data?.models) ? data.models : [];
    return models
      .map((m) => ({ name: m.name ?? m.model ?? "", size: m.size ?? null }))
      .filter((m) => m.name);
  } finally {
    clearTimeout(timer);
  }
}

export class OllamaAdapter extends AiProvider {
  constructor(config) {
    super();
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    // Ollama ignores the key; the SDK requires a non-empty string.
    this.client = new OpenAI({ apiKey: "ollama", baseURL: `${this.baseUrl}/v1` });
    this.model = config.model || "";
    this.maxTokens = config.maxTokens || 2048;
    this.timeoutMs = config.timeoutMs || 30000;
  }

  async suggest(artifact, context = "") {
    const prompt = buildPrompt(artifact.type, artifact.fields, context, artifact.language);

    const response = await this.client.chat.completions.create(
      {
        model: this.model,
        max_tokens: this.maxTokens,
        // JSON mode; the sanitizing parsers are the safety net for models
        // that honor it loosely.
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      },
      { timeout: this.timeoutMs }
    );

    const text = response.choices[0]?.message?.content ?? "";
    return { ...parseSuggestions(text, artifact.type), usage: extractUsage(response) };
  }

  async extractFromDocument(prompt) {
    const response = await this.client.chat.completions.create(
      {
        model: this.model,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      },
      { timeout: this.timeoutMs }
    );
    return {
      text: response.choices[0]?.message?.content ?? "",
      usage: extractUsage(response),
    };
  }

  // Conversational turn returning structured JSON ({ reply, proposal }).
  // schema is described in the system prompt; JSON mode guarantees valid JSON.
  async chat(messages, _schema) {
    const response = await this.client.chat.completions.create(
      {
        model: this.model,
        max_tokens: this.maxTokens,
        response_format: { type: "json_object" },
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      },
      { timeout: this.timeoutMs }
    );
    const text = response.choices[0]?.message?.content ?? "";
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { reply: text, proposal: null };
    }
    return { json, usage: extractUsage(response) };
  }

  async testConnection() {
    // Fast, meaningful check: server reachable + chosen model installed.
    // Avoids a cold model load (which can exceed the test timeout).
    const models = await listOllamaModels(this.baseUrl, { timeoutMs: 5000 });
    if (models.length === 0) {
      return "verbunden, aber keine Modelle installiert (z. B. „ollama pull llama3.2“)";
    }
    if (this.model && !models.some((m) => m.name === this.model)) {
      throw new Error(
        `Modell „${this.model}“ ist nicht installiert. Verfügbar: ${models.map((m) => m.name).join(", ")}`
      );
    }
    return `OK — ${models.length} Modell(e) verfügbar`;
  }
}
