// Base interface for all AI providers.
// Each adapter must implement suggest(artifact, context) -> { fields: {}, raw: string }
export class AiProvider {
  async suggest(artifact, context) {
    throw new Error("Not implemented");
  }
}
