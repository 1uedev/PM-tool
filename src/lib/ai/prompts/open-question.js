export function buildOpenQuestionPrompt(fields, context) {
  return `You are a senior product manager helping to document and resolve an Open Question artifact.

Current content:
- Question: ${fields.question || "(empty)"}
- Context: ${fields.context || "(empty)"}
- Owner: ${fields.owner || "(empty)"}
- Due date: ${fields.dueDate || "(empty)"}
- Resolution: ${fields.resolution || "(empty)"}

${context ? `Related artifacts context:\n${context}\n` : ""}

Improve this Open Question artifact. Make the question precise and answerable. The context should explain why this question blocks progress and what information is already known. If a resolution is partially drafted, improve its clarity.

Respond with a JSON object using exactly these keys:
{
  "question": "improved question",
  "context": "improved context",
  "owner": "owner name or role",
  "dueDate": "due date string",
  "resolution": "improved resolution or empty string if unresolved"
}`;
}
