export function buildFeaturePrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine Feature-Beschreibung.

Aktuelle Felder (können leer sein):
- Beschreibung: ${fields.description || "(leer)"}
- Nutzen für den User: ${fields.userValue || "(leer)"}
- Im Scope: ${fields.inScope || "(leer)"}
- Nicht im Scope: ${fields.outOfScope || "(leer)"}
- Priorität: ${fields.priority || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "description": "...",
  "userValue": "...",
  "inScope": "...",
  "outOfScope": "...",
  "priority": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Beschreibung klar und nutzerzentriert (nicht technisch)
- In-Scope und Out-of-Scope als konkrete Aufzählungen
- Priorität mit Begründung (Hoch / Mittel / Niedrig + warum)
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
