export function buildUserPersonaPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine User Persona für ein Softwareprodukt.

Aktuelle Felder (können leer sein):
- Name: ${fields.name || "(leer)"}
- Ziele: ${fields.goals || "(leer)"}
- Pain Points: ${fields.painPoints || "(leer)"}
- Kontext / Hintergrund: ${fields.context || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "name": "...",
  "goals": "...",
  "painPoints": "...",
  "context": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Konkret und praxisnah formulieren
- Deutsch
- Kein Markdown, kein Text außerhalb des JSON`;
}
