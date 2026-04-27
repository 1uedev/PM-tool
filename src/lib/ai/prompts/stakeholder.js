export function buildStakeholderPrompt(fields, context) {
  return `You are a senior product manager helping to document a Stakeholder artifact.

Current content:
- Name: ${fields.name || "(empty)"}
- Role / Title: ${fields.role || "(empty)"}
- RACI involvement: ${fields.involvement || "(empty)"}
- Responsibility: ${fields.responsibility || "(empty)"}
- Contact / Team: ${fields.contact || "(empty)"}

${context ? `Related artifacts context:\n${context}\n` : ""}

Improve this Stakeholder artifact. The responsibility field should clearly describe what this person owns, decides, or is accountable for in the context of the project. Suggest a RACI level if not set.

Respond with a JSON object using exactly these keys:
{
  "name": "stakeholder name",
  "role": "role or title",
  "involvement": "Responsible|Accountable|Consulted|Informed",
  "responsibility": "improved responsibility description",
  "contact": "contact info"
}`;
}
