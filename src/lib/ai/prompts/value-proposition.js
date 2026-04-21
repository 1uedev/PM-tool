export function buildValuePropositionPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere eine Value Proposition.

Aktuelle Felder (können leer sein):
- Value Proposition Statement: ${fields.statement || "(leer)"}
- Zielkunde: ${fields.targetCustomer || "(leer)"}
- Hauptnutzen: ${fields.keyBenefit || "(leer)"}
- Differenzierungsmerkmal: ${fields.differentiator || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "statement": "...",
  "targetCustomer": "...",
  "keyBenefit": "...",
  "differentiator": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Statement im Format: "Wir helfen [Zielgruppe] dabei, [Problem] zu lösen, indem wir [Lösung] anbieten — anders als [Alternative]."
- Differenzierung klar vom Wettbewerb abgrenzen
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
