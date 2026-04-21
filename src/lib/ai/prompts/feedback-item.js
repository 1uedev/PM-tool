export function buildFeedbackItemPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere ein Feedback-Item.

Aktuelle Felder (können leer sein):
- Quelle: ${fields.source || "(leer)"}
- Feedback-Inhalt: ${fields.content || "(leer)"}
- Bewertung / Sentiment: ${fields.sentiment || "(leer)"}
- Maßnahmen: ${fields.actionItems || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "source": "...",
  "content": "...",
  "sentiment": "...",
  "actionItems": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Quelle: Nutzer-Interview / Support-Ticket / NPS-Umfrage / App-Store-Review / Sales-Call etc.
- Sentiment: Positiv / Negativ / Neutral mit Begründung
- Maßnahmen: konkrete, umsetzbare Produktverbesserungen oder Backlog-Items
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
