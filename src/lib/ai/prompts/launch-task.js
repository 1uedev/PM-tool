export function buildLaunchTaskPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine Launch-Aufgabe.

Aktuelle Felder (können leer sein):
- Aufgabenbeschreibung: ${fields.description || "(leer)"}
- Verantwortlicher: ${fields.owner || "(leer)"}
- Fälligkeitsdatum: ${fields.dueDate || "(leer)"}
- Checkliste: ${fields.checklist || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "description": "...",
  "owner": "...",
  "dueDate": "...",
  "checklist": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Beschreibung: Was muss konkret erledigt werden und warum ist es für den Launch kritisch?
- Checkliste als Aufzählung im Format "- [ ] Schritt 1\n- [ ] Schritt 2..." (4–6 Schritte)
- Fälligkeitsdatum relativ zum Launch (z. B. "2 Wochen vor Launch" oder konkretes Datum)
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
