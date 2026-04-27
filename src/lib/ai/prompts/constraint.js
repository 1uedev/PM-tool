export function buildConstraintPrompt(fields, context) {
  return `You are a senior product manager helping to document a Constraint artifact.

Current content:
- Constraint: ${fields.constraint || "(empty)"}
- Type: ${fields.type || "(empty)"}
- Rationale: ${fields.rationale || "(empty)"}
- Impact on project: ${fields.impact || "(empty)"}

${context ? `Related artifacts context:\n${context}\n` : ""}

Improve this Constraint artifact. The constraint statement should be unambiguous and non-negotiable. The rationale should trace back to its source (legal, technical, business). The impact should describe how this constraint shapes scope, design, or timeline.

Respond with a JSON object using exactly these keys:
{
  "constraint": "improved constraint statement",
  "type": "Technical|Budget|Regulatory|Time|Resource",
  "rationale": "improved rationale",
  "impact": "improved impact description"
}`;
}
