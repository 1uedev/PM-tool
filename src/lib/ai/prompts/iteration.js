export function buildIterationPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere ein Iterations-Dokument (Retrospektive und nächste Schritte).

Aktuelle Felder (können leer sein):
- Beschreibung der Iteration: ${fields.description || "(leer)"}
- Learnings: ${fields.learnings || "(leer)"}
- Verbesserungsmaßnahmen: ${fields.improvements || "(leer)"}
- Nächste Schritte: ${fields.nextSteps || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "description": "...",
  "learnings": "...",
  "improvements": "...",
  "nextSteps": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Learnings: Was hat funktioniert, was nicht? Konkrete Erkenntnisse (3–5 Punkte)
- Verbesserungsmaßnahmen: direkt umsetzbar, mit Verantwortlichkeit
- Nächste Schritte: priorisierte Liste der Top-3 Aktionen für die nächste Iteration
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
