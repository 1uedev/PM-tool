export function buildBusinessModelPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere ein Geschäftsmodell-Dokument.

Aktuelle Felder (können leer sein):
- Einnahmequellen: ${fields.revenueStreams || "(leer)"}
- Kostenstruktur: ${fields.costStructure || "(leer)"}
- Vertriebskanäle: ${fields.channels || "(leer)"}
- Wichtige Partner: ${fields.keyPartners || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "revenueStreams": "...",
  "costStructure": "...",
  "channels": "...",
  "keyPartners": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Einnahmequellen mit Preismodell und Volumen-Logik (Abo, Lizenz, Transaktion etc.)
- Kosten aufschlüsseln nach Fix- und variable Kosten
- Kanäle differenzieren nach Direkt, PLG, Partner, Marketplace
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
