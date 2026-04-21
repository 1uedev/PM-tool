export function buildUserStoryPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine User Story.

Aktuelle Felder:
- Als (Rolle): ${fields.role || "(leer)"}
- möchte ich (Aktion): ${fields.action || "(leer)"}
- damit (Nutzen): ${fields.benefit || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt:
{
  "role": "...",
  "action": "...",
  "benefit": "..."
}

Regeln:
- Rolle: kurz und spezifisch (kein "ich" oder "Nutzer" allgemein)
- Aktion: konkrete, umsetzbare Funktion
- Nutzen: messbarer Mehrwert aus Nutzersicht
- Deutsch, kein Text außerhalb des JSON`;
}
