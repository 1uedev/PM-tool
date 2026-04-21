export function buildUserJourneyPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager und UX-Designer. Erstelle oder verbessere eine User Journey Map.

Aktuelle Felder (können leer sein):
- Akteur / Persona: ${fields.actor || "(leer)"}
- Szenario: ${fields.scenario || "(leer)"}
- Journey-Schritte: ${fields.steps || "(leer)"}
- Pain Points in der Journey: ${fields.painPoints || "(leer)"}
- Verbesserungspotenziale: ${fields.opportunities || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "actor": "...",
  "scenario": "...",
  "steps": "...",
  "painPoints": "...",
  "opportunities": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Journey-Schritte im Format: "1. Schritt: [Aktion] — [Gedanken] — [Gefühl]" (mind. 4 Schritte)
- Pain Points konkret und emotional beschreiben
- Verbesserungspotenziale als umsetzbare Produktmaßnahmen
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
