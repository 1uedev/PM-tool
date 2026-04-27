export function buildProblemStatementPrompt(fields, context) {
  return `You are a senior product manager helping to define a Problem Statement artifact.

Current content:
- Problem: ${fields.problem || "(empty)"}
- Context: ${fields.context || "(empty)"}
- Impact: ${fields.impact || "(empty)"}
- How users solve it today: ${fields.currentSolution || "(empty)"}
- Why the current solution is insufficient: ${fields.whyInsufficient || "(empty)"}

${context ? `Related artifacts context:\n${context}\n` : ""}

Improve this Problem Statement. The problem should be user-centric and specific, not technical. The impact should reference both user pain and business consequence. The current solution field should describe the actual workaround (manual process, spreadsheet, existing tool). The "why insufficient" field should clearly articulate the gap that justifies building something new (too slow, expensive, unreliable, doesn't scale, poor UX, risky, etc.).

Respond with a JSON object using exactly these keys:
{
  "problem": "improved problem statement",
  "context": "improved context",
  "impact": "improved impact description",
  "currentSolution": "how users solve it today",
  "whyInsufficient": "why the current solution falls short"
}`;
}
