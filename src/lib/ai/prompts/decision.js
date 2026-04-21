export function buildDecisionPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere ein Entscheidungsdokument (Architecture Decision Record).

Aktuelle Felder (können leer sein):
- Kontext / Hintergrund: ${fields.context || "(leer)"}
- Getroffene Entscheidung: ${fields.decision || "(leer)"}
- Begründung: ${fields.rationale || "(leer)"}
- Verworfene Alternativen: ${fields.alternatives || "(leer)"}
- Konsequenzen: ${fields.consequences || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "context": "...",
  "decision": "...",
  "rationale": "...",
  "alternatives": "...",
  "consequences": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Entscheidung klar und eindeutig formulieren (was genau wurde entschieden)
- Begründung mit Kriterien (Kosten, Zeit, Risiko, Qualität)
- Mindestens 2 verworfene Alternativen mit Begründung der Ablehnung
- Konsequenzen positiv und negativ benennen
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
