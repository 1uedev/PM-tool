import Anthropic from "@anthropic-ai/sdk";
import { AiProvider } from "./provider.js";
import { buildPrompt, parseSuggestions } from "./prompts/index.js";

export class ClaudeAdapter extends AiProvider {
  constructor() {
    super();
    this.client = new Anthropic({ apiKey: process.env.AI_CLAUDE_API_KEY });
    this.model = "claude-sonnet-4-6";
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS ?? "2048", 10);
    this.timeoutMs = parseInt(process.env.AI_TIMEOUT_MS ?? "30000", 10);
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
    return parseSuggestions(text, artifact.type);
  }
}
