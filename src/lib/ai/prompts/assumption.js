export function buildAssumptionPrompt(fields, context) {
  return `You are a senior product manager helping to document and validate an Assumption artifact.

Current content:
- Assumption: ${fields.assumption || "(empty)"}
- Rationale: ${fields.rationale || "(empty)"}
- Impact if wrong: ${fields.impact || "(empty)"}
- How to validate: ${fields.validatedBy || "(empty)"}
- Owner: ${fields.owner || "(empty)"}

${context ? `Related artifacts context:\n${context}\n` : ""}

Improve this Assumption artifact. Make the assumption statement precise and falsifiable. The rationale should explain the evidence behind it. The impact if wrong should be concrete. The validation approach should be actionable.

Respond with a JSON object using exactly these keys:
{
  "assumption": "improved assumption statement",
  "rationale": "improved rationale",
  "impact": "improved impact description",
  "validatedBy": "improved validation approach",
  "owner": "owner name or role"
}`;
}
