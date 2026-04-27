export function buildTestPlanPrompt(fields, context) {
  return `You are a senior product manager or QA lead helping to define a Test Plan artifact.

Current content:
- Scope: ${fields.scope || "(empty)"}
- Test approach: ${fields.approach || "(empty)"}
- Entry criteria: ${fields.entryCriteria || "(empty)"}
- Exit criteria: ${fields.exitCriteria || "(empty)"}
- Test risks: ${fields.risks || "(empty)"}
- Owner: ${fields.owner || "(empty)"}

${context ? `Related artifacts context:\n${context}\n` : ""}

Improve this Test Plan. The scope should name specific features or requirements being tested. The approach should describe the types of testing (unit, integration, E2E, performance, security). Entry and exit criteria should be concrete and objectively verifiable.

Respond with a JSON object using exactly these keys:
{
  "scope": "improved scope",
  "approach": "improved test approach",
  "entryCriteria": "improved entry criteria",
  "exitCriteria": "improved exit criteria",
  "risks": "improved test risks",
  "owner": "owner name or role"
}`;
}
