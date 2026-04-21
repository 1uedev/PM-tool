export function buildProblemStatementPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere ein Problem Statement.

Aktuelle Felder (können leer sein):
- Problem: ${fields.problem || "(leer)"}
- Kontext: ${fields.context || "(leer)"}
- Auswirkung: ${fields.impact || "(leer)"}
- Aktuelle Lösung / Workaround: ${fields.currentSolution || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "problem": "...",
  "context": "...",
  "impact": "...",
  "currentSolution": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Problem klar und nutzerzentriert beschreiben (nicht technisch)
- Auswirkung mit Bezug auf Nutzer und Business quantifizieren wo möglich
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
