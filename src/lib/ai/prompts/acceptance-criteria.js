export function buildAcceptanceCriteriaPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere Akzeptanzkriterien im Given/When/Then-Format.

Aktuelle Felder (können leer sein):
- Szenario (Given / When / Then): ${fields.scenario || "(leer)"}
- Vorbedingungen: ${fields.preconditions || "(leer)"}
- Erwartetes Ergebnis: ${fields.expectedResult || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "scenario": "...",
  "preconditions": "...",
  "expectedResult": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Szenario strikt im Format: "Given [Ausgangszustand]\nWhen [Aktion]\nThen [Erwartetes Ergebnis]"
- Vorbedingungen: was muss vor dem Test erfüllt sein?
- Erwartetes Ergebnis: eindeutig, testbar, beobachtbar
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
