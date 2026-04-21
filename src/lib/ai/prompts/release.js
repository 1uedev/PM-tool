export function buildReleasePrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere ein Release-Dokument.

Aktuelle Felder (können leer sein):
- Version: ${fields.version || "(leer)"}
- Beschreibung: ${fields.description || "(leer)"}
- Zieldatum: ${fields.targetDate || "(leer)"}
- Scope / Enthaltene Features: ${fields.scope || "(leer)"}
- Release Notes: ${fields.releaseNotes || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "version": "...",
  "description": "...",
  "targetDate": "...",
  "scope": "...",
  "releaseNotes": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Beschreibung kurz und prägnant (1–2 Sätze, was dieses Release charakterisiert)
- Scope als Aufzählung der enthaltenen Features/Epics
- Release Notes nutzerzentriert (was ändert sich aus Sicht des Nutzers?)
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
