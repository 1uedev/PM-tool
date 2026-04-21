export function buildRoadmapItemPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere einen Roadmap-Eintrag.

Aktuelle Felder (können leer sein):
- Beschreibung: ${fields.description || "(leer)"}
- Zeitraum / Quartal: ${fields.timeframe || "(leer)"}
- Verknüpfte Features / Epics: ${fields.relatedFeatures || "(leer)"}
- Begründung / strategische Relevanz: ${fields.rationale || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "description": "...",
  "timeframe": "...",
  "relatedFeatures": "...",
  "rationale": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Beschreibung aus Kundenperspektive (was wird geliefert, welchen Wert hat es?)
- Zeitraum: Now / Next / Later oder konkretes Quartal (z. B. Q3 2025)
- Strategische Relevanz mit Bezug auf Unternehmensziele oder OKRs
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
