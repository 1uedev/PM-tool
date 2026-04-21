export function buildPositioningPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere ein Positionierungsdokument.

Aktuelle Felder (können leer sein):
- Positionierungsaussage: ${fields.statement || "(leer)"}
- Zielsegment: ${fields.targetSegment || "(leer)"}
- Wettbewerbsvorteil: ${fields.competitiveAdvantage || "(leer)"}
- Kernbotschaft: ${fields.keyMessage || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "statement": "...",
  "targetSegment": "...",
  "competitiveAdvantage": "...",
  "keyMessage": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Statement im Format: "Für [Zielgruppe], die [Bedürfnis], ist [Produkt] die [Kategorie], die [Nutzen] — anders als [Alternative]."
- Wettbewerbsvorteil nachhaltig und schwer kopierbar formulieren
- Kernbotschaft maximal ein prägnanter Satz
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
