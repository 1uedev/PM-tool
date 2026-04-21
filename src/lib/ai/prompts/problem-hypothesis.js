export function buildProblemHypothesisPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine Problem-Hypothese.

Aktuelle Felder:
- Problem: ${fields.problem || "(leer)"}
- Zielgruppe: ${fields.targetAudience || "(leer)"}
- Annahme: ${fields.assumption || "(leer)"}
- Validierungsansatz: ${fields.validation || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt:
{
  "problem": "...",
  "targetAudience": "...",
  "assumption": "...",
  "validation": "..."
}

Regeln:
- Problem klar und konkret beschreiben
- Annahme als falsifizierbare Hypothese formulieren
- Validierungsansatz mit konkreten Methoden
- Deutsch, kein Text außerhalb des JSON`;
}
