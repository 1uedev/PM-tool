export function buildEpicPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere ein Epic-Dokument.

Aktuelle Felder (können leer sein):
- Beschreibung: ${fields.description || "(leer)"}
- Ziele: ${fields.goals || "(leer)"}
- Scope: ${fields.scope || "(leer)"}
- Erfolgskriterien: ${fields.successCriteria || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "description": "...",
  "goals": "...",
  "scope": "...",
  "successCriteria": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Ziele mit Business-Outcome verknüpfen
- Scope klar abgrenzen: Was ist explizit enthalten, was explizit nicht?
- Erfolgskriterien messbar und abnahmefähig formulieren
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
