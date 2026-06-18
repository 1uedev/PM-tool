// Base interface for all AI providers.
// Each adapter must implement suggest(artifact, context) -> { fields: {}, raw: string }
export class AiProvider {
  async suggest(artifact, context) {
    throw new Error("Not implemented");
  }

  // Used by document import: sends a raw prompt and returns the response text.
  async extractFromDocument(prompt) {
    throw new Error("Not implemented");
  }

  // Used by the AI content chat: sends a message array and a JSON schema,
  // returns { json, usage } where json is one structured turn.
  async chat(messages, schema) {
    throw new Error("Not implemented");
  }
}
