export function buildBuyerPersonaPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine Buyer Persona für ein B2B-Softwareprodukt.

Aktuelle Felder (können leer sein):
- Name der Buyer Persona: ${fields.name || "(leer)"}
- Rolle / Position: ${fields.role || "(leer)"}
- Geschäftliche Ziele: ${fields.goals || "(leer)"}
- Pain Points: ${fields.painPoints || "(leer)"}
- Kaufkriterien: ${fields.buyingCriteria || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "name": "...",
  "role": "...",
  "goals": "...",
  "painPoints": "...",
  "buyingCriteria": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Name als Archetyp-Bezeichnung (z. B. "IT-Einkäufer Mittelstand")
- Kaufkriterien mit ROI, Sicherheit, Compliance, TCO und Integrationsaufwand berücksichtigen
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
