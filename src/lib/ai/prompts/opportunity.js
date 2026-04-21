export function buildOpportunityPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine Opportunity-Beschreibung.

Aktuelle Felder (können leer sein):
- Beschreibung der Opportunity: ${fields.description || "(leer)"}
- Zielgruppe: ${fields.targetAudience || "(leer)"}
- Potenzieller Wert: ${fields.potentialValue || "(leer)"}
- Zeitliche Einschätzung: ${fields.timeToMarket || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "description": "...",
  "targetAudience": "...",
  "potentialValue": "...",
  "timeToMarket": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Opportunity klar als Chance formulieren (nicht als Problem)
- Potenziellen Wert mit Business- und Nutzerperspektive begründen
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
