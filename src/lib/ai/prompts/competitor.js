export function buildCompetitorPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine Wettbewerberanalyse.

Aktuelle Felder (können leer sein):
- Name des Wettbewerbers: ${fields.name || "(leer)"}
- Stärken: ${fields.strengths || "(leer)"}
- Schwächen: ${fields.weaknesses || "(leer)"}
- Positionierung: ${fields.positioning || "(leer)"}
- Unser Differenzierungsmerkmal: ${fields.differentiator || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "name": "...",
  "strengths": "...",
  "weaknesses": "...",
  "positioning": "...",
  "differentiator": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Stärken und Schwächen als konkrete Aufzählung (3–5 Punkte je)
- Differenzierungsmerkmal klar und wettbewerbsorientiert formulieren
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
