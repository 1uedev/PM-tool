export function buildKpiOkrPrompt(fields, context) {
  return `Du bist ein erfahrener Product Manager. Erstelle oder verbessere ein OKR-Dokument.

Aktuelle Felder (können leer sein):
- Objective / Ziel: ${fields.objective || "(leer)"}
- Key Results: ${fields.keyResults || "(leer)"}
- Metriken / KPIs: ${fields.metrics || "(leer)"}
- Zeitraum: ${fields.timeframe || "(leer)"}
- Verantwortlicher: ${fields.owner || "(leer)"}

${context ? `Zusätzlicher Projektkontext:\n${context}\n` : ""}

Antworte ausschließlich mit einem validen JSON-Objekt in diesem Format:
{
  "objective": "...",
  "keyResults": "...",
  "metrics": "...",
  "timeframe": "...",
  "owner": "..."
}

Regeln:
- Alle Felder ausfüllen, auch wenn sie bereits vorhanden sind (verbessern/erweitern)
- Objective: qualitativ, inspirierend, richtungsweisend (kein Zahlen-Ziel)
- Key Results: 3 messbare, zeitgebundene Ergebnisse im Format "KR1: [Metrik] von X auf Y bis [Datum]"
- Metriken: 2–4 konkrete KPIs mit Messmethode
- Zeitraum: Quartal oder Halbjahr
- Deutsch, kein Markdown, kein Text außerhalb des JSON`;
}
