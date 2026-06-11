import Anthropic from "@anthropic-ai/sdk";
import { AiProvider } from "./provider.js";
import { buildPrompt, parseSuggestions } from "./prompts/index.js";
import { AI_DEFAULT_MODELS } from "@/lib/constants.js";

// Normalize Anthropic usage reporting to { inputTokens, outputTokens }
function extractUsage(response) {
  return {
    inputTokens: response?.usage?.input_tokens ?? null,
    outputTokens: response?.usage?.output_tokens ?? null,
  };
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
    const prompt = buildPrompt(artifact.type, artifact.fields, context);

    const response = await this.client.messages.create(
      {
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: "user", content: prompt }],
      },
      { timeout: this.timeoutMs }
    );

    const text = response.content[0]?.text ?? "";
    return { ...parseSuggestions(text, artifact.type), usage: extractUsage(response) };
  }

  async extractFromDocument(prompt) {
    const response = await this.client.messages.create(
      {
        model: this.model,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      },
      { timeout: this.timeoutMs }
    );
    return {
      text: response.content[0]?.text ?? "",
      usage: extractUsage(response),
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
