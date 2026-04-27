export function buildGoalsNonGoalsPrompt(fields, context) {
  return `You are a senior product manager helping to refine a Goals & Non-Goals artifact.

Current content:
- Goals (in scope): ${fields.goals || "(empty)"}
- Non-Goals (out of scope): ${fields.nonGoals || "(empty)"}
- Rationale: ${fields.rationale || "(empty)"}

${context ? `Related artifacts context:\n${context}\n` : ""}

Improve this Goals & Non-Goals artifact. Make the goals specific, measurable, and outcome-oriented. Make the non-goals explicit to prevent scope creep. The rationale should explain the boundary decisions clearly.

Respond with a JSON object using exactly these keys:
{
  "goals": "improved goals text",
  "nonGoals": "improved non-goals text",
  "rationale": "improved rationale text"
}`;
}
