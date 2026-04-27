export function buildComplianceRequirementPrompt(fields, context) {
  return `You are a senior product manager helping to document a Compliance Requirement artifact.

Current content:
- Requirement: ${fields.requirement || "(empty)"}
- Regulation / Standard: ${fields.regulation || "(empty)"}
- Scope: ${fields.scope || "(empty)"}
- Implementation approach: ${fields.implementation || "(empty)"}
- Owner: ${fields.owner || "(empty)"}
- Deadline: ${fields.deadline || "(empty)"}

${context ? `Related artifacts context:\n${context}\n` : ""}

Improve this Compliance Requirement. The requirement statement should be precise and traceable to a specific regulation or standard. The implementation approach should describe concrete technical or process controls. The scope should clearly define which systems, data, or processes are covered.

Respond with a JSON object using exactly these keys:
{
  "requirement": "improved requirement statement",
  "regulation": "regulation or standard name",
  "scope": "improved scope",
  "implementation": "improved implementation approach",
  "owner": "owner name or role",
  "deadline": "deadline string"
}`;
}
