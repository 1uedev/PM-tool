export function buildUseCasePrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere einen Use Case.

Aktuelle Felder:
- Akteur: ${fields.actor || "(leer)"}
- Ziel: ${fields.goal || "(leer)"}
- Vorbedingungen: ${fields.preconditions || "(leer)"}
- Ablauf: ${fields.flow || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt:
{
  "actor": "...",
  "goal": "...",
  "preconditions": "...",
  "flow": "..."
}

Regeln:
- Ablauf als nummerierte Schritte (1. … 2. … 3. …)
- Jeden Schritt in einer Zeile
- Akteur und Systemreaktion klar trennen
- Deutsch, kein Text außerhalb des JSON`;
}
