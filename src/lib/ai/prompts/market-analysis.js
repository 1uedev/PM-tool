export function buildMarketAnalysisPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager und Marktanalyst. Erstelle oder verbessere eine Marktanalyse.

Aktuelle Felder (können leer sein):
- Zusammenfassung: ${fields.summary || "(leer)"}
- Marktgröße (TAM / SAM / SOM): ${fields.marketSize || "(leer)"}
- Wichtige Trends: ${fields.trends || "(leer)"}
- Quellen: ${fields.sources || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "summary": "...",
  "marketSize": "...",
  "trends": "...",
  "sources": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Marktgröße mit konkreten Zahlen und Einheiten (z. B. TAM: 2 Mrd. €)
- Trends als klare Aufzählung (3–5 Trends)
- Quellen als plausible Referenzen (Studien, Gartner, Forrester etc.)
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
