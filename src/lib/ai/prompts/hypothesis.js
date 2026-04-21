export function buildHypothesisPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine Hypothese im strukturierten Format.

Aktuelle Felder (können leer sein):
- Annahme: ${fields.assumption || "(leer)"}
- Begründung: ${fields.rationale || "(leer)"}
- Testmethode: ${fields.testMethod || "(leer)"}
- Erfolgskriterium: ${fields.successCriteria || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "assumption": "...",
  "rationale": "...",
  "testMethod": "...",
  "successCriteria": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Annahme im Format "Wir glauben, dass [Nutzergruppe] [Problem/Verhalten]..."
- Testmethode konkret (Interview, A/B-Test, Prototype, Survey etc.)
- Erfolgskriterium messbar und zeitgebunden
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
