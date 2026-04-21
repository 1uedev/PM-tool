import { buildUserPersonaPrompt } from "./user-persona.js";
import { buildProblemHypothesisPrompt } from "./problem-hypothesis.js";
import { buildProductVisionPrompt } from "./product-vision.js";
import { buildUseCasePrompt } from "./use-case.js";
import { buildUserStoryPrompt } from "./user-story.js";
import { buildFunctionalRequirementPrompt } from "./functional-requirement.js";

const PROMPT_BUILDERS = {
  USER_PERSONA: buildUserPersonaPrompt,
  PROBLEM_HYPOTHESIS: buildProblemHypothesisPrompt,
  PRODUCT_VISION: buildProductVisionPrompt,
  USE_CASE: buildUseCasePrompt,
  USER_STORY: buildUserStoryPrompt,
  FUNCTIONAL_REQUIREMENT: buildFunctionalRequirementPrompt,
};

export function buildPrompt(artifactType, fields, context = "") {
  const builder = PROMPT_BUILDERS[artifactType];
  if (!builder) throw new Error(`No prompt builder for type: ${artifactType}`);
  return builder(fields, context);
}

// Parse the AI response into structured field suggestions.
// Returns { fields: {...} } or falls back to { raw: text } on parse failure.
export function parseSuggestions(text, artifactType) {
  try {
    // Extract JSON from response (model may wrap it in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);
    // Ensure all values are strings
    const fields = Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, String(v ?? "")])
    );
    return { fields };
  } catch {
    // Fallback: return raw text so UI can still show something
    return { raw: text };
  }
}
