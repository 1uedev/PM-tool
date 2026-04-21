export function buildProductVisionPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine Produktvision.

Aktuelle Felder:
- Einzeiler / Elevator Pitch: ${fields.oneLiner || "(leer)"}
- Zielnutzer: ${fields.targetUsers || "(leer)"}
- Nutzenversprechen: ${fields.valueProposition || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt:
{
  "oneLiner": "...",
  "targetUsers": "...",
  "valueProposition": "..."
}

Regeln:
- Einzeiler: prägnante „Für X, die Y, ist Z ein A, das B"-Formel
- Nutzenversprechen: konkrete, messbare Vorteile
- Deutsch, kein Text außerhalb des JSON`;
}
