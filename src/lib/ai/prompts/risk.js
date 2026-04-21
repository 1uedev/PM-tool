export function buildRiskPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine Risikoanalyse.

Aktuelle Felder (können leer sein):
- Risikobeschreibung: ${fields.description || "(leer)"}
- Wahrscheinlichkeit: ${fields.probability || "(leer)"}
- Auswirkung: ${fields.impact || "(leer)"}
- Mitigationsstrategie: ${fields.mitigation || "(leer)"}
- Verantwortlicher: ${fields.owner || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "description": "...",
  "probability": "...",
  "impact": "...",
  "mitigation": "...",
  "owner": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Wahrscheinlichkeit: Hoch / Mittel / Niedrig mit kurzer Begründung
- Auswirkung: Hoch / Mittel / Niedrig auf Zeitplan, Budget oder Qualität
- Mitigation: 2–3 konkrete Gegenmaßnahmen (Vermeiden, Reduzieren, Übertragen, Akzeptieren)
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
