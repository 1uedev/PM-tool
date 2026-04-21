export function buildNonFunctionalRequirementPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine nicht-funktionale Anforderung.

Aktuelle Felder (können leer sein):
- Beschreibung: ${fields.description || "(leer)"}
- Kategorie: ${fields.category || "(leer)"}
- Messbare Metrik: ${fields.metric || "(leer)"}
- Akzeptanzkriterien: ${fields.acceptanceCriteria || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "description": "...",
  "category": "...",
  "metric": "...",
  "acceptanceCriteria": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Kategorie aus: Performance / Sicherheit / Zuverlässigkeit / Skalierbarkeit / Usability / Wartbarkeit
- Metrik mit konkretem Schwellenwert und Messbedingung (z. B. "p95 Antwortzeit < 300 ms bei 500 gleichzeitigen Nutzern")
- Akzeptanzkriterien testbar und eindeutig
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
