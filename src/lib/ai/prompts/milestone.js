export function buildMilestonePrompt(fields, context) {
  return `You are a senior product manager helping to define a Milestone artifact.

Current content:
- Description: ${fields.description || "(empty)"}
- Target date: ${fields.targetDate || "(empty)"}
- Owner: ${fields.owner || "(empty)"}
- Success criteria: ${fields.criteria || "(empty)"}
- Status: ${fields.status || "(empty)"}

${context ? `Related artifacts context:\n${context}\n` : ""}

Improve this Milestone artifact. The description should clearly define the project state when this milestone is reached. The success criteria should be objectively verifiable — avoid vague language.

Respond with a JSON object using exactly these keys:
{
  "description": "improved description",
  "targetDate": "target date string",
  "owner": "owner name or role",
  "criteria": "improved success criteria",
  "status": "Not started|In progress|At risk|Completed"
}`;
}
