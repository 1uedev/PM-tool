export function buildFunctionalRequirementPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine funktionale Anforderung.

Aktuelle Felder:
- Beschreibung: ${fields.description || "(leer)"}
- Akzeptanzkriterien: ${fields.acceptanceCriteria || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt:
{
  "description": "...",
  "acceptanceCriteria": "..."
}

Regeln:
- Beschreibung: präzise, testbare Anforderung ("Das System muss…")
- Akzeptanzkriterien: ein Kriterium pro Zeile, beginnend mit "- "
- Jedes Kriterium messbar und testbar
- Deutsch, kein Text außerhalb des JSON`;
}
