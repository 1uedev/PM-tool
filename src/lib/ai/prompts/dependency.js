export function buildDependencyPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine Abhängigkeitsbeschreibung.

Aktuelle Felder (können leer sein):
- Beschreibung der Abhängigkeit: ${fields.description || "(leer)"}
- Abhängig von: ${fields.dependsOn || "(leer)"}
- Typ: ${fields.type || "(leer)"}
- Auswirkung bei Nicht-Erfüllung: ${fields.impact || "(leer)"}
- Verantwortlicher: ${fields.owner || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "description": "...",
  "dependsOn": "...",
  "type": "...",
  "impact": "...",
  "owner": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Typ aus: Intern / Extern / Technisch / Organisatorisch
- Auswirkung bei Nicht-Erfüllung mit Verzögerungs- und Risikopotenzial beschreiben
- Verantwortlichen konkret benennen (Person oder Team)
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
