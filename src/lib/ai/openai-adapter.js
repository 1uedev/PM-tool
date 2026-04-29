import OpenAI from "openai";
import { AiProvider } from "./provider.js";
import { buildPrompt, parseSuggestions } from "./prompts/index.js";

export class OpenAiAdapter extends AiProvider {
  constructor(config) {
    super();
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model || "gpt-4o";
    this.maxTokens = config.maxTokens || 2048;
    this.timeoutMs = config.timeoutMs || 30000;
  }

  async suggest(artifact, context = "") {
    const prompt = buildPrompt(artifact.type, artifact.fields, context);

    const response = await this.client.chat.completions.create(
      {
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: "user", content: prompt }],
      },
      { timeout: this.timeoutMs }
    );

    const text = response.choices[0]?.message?.content ?? "";
    return parseSuggestions(text, artifact.type);
  }

  async extractFromDocument(prompt) {
    const response = await this.client.chat.completions.create(
      {
        model: this.model,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      },
      { timeout: this.timeoutMs }
    );
    return response.choices[0]?.message?.content ?? "";
  }

  async testConnection() {
    const response = await this.client.chat.completions.create(
      {
        model: this.model,
        max_tokens: 5,
        messages: [{ role: "user", content: "Reply with OK" }],
      },
      { timeout: 10000 }
    );
    return response.choices[0]?.message?.content ?? "OK";
  }
}
