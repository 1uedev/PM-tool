export function buildResearchFindingPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager und UX-Researcher. Erstelle oder verbessere ein Research Finding.

Aktuelle Felder (können leer sein):
- Kernaussage / Insight: ${fields.insight || "(leer)"}
- Forschungsmethode: ${fields.method || "(leer)"}
- Teilnehmer / Sample: ${fields.participants || "(leer)"}
- Implikationen fürs Produkt: ${fields.implications || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "insight": "...",
  "method": "...",
  "participants": "...",
  "implications": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Insight präzise und handlungsorientiert formulieren
- Implikationen direkt mit Produktentscheidungen verknüpfen
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
