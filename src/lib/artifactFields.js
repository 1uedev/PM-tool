// Field definitions per artifact type.
// Each field: { key, label, placeholder, multiline, rows }
// Used by ArtifactForm and AI prompt templates.

export const ARTIFACT_FIELD_DEFS = {

  // ─── Research ───

  MARKET_ANALYSIS: [
    { key: "summary", label: "Zusammenfassung", placeholder: "Überblick über den Markt", multiline: true, rows: 3 },
    { key: "marketSize", label: "Marktgröße (TAM / SAM / SOM)", placeholder: "z. B. TAM: 5 Mrd. €, SAM: 500 Mio. €", multiline: false },
    { key: "trends", label: "Wichtige Trends", placeholder: "Welche Trends prägen den Markt?", multiline: true, rows: 4 },
    { key: "sources", label: "Quellen", placeholder: "Studien, Berichte, Daten…", multiline: true, rows: 2 },
  ],

  COMPETITOR: [
    { key: "name", label: "Name des Wettbewerbers", placeholder: "z. B. Acme Corp", multiline: false },
    { key: "strengths", label: "Stärken", placeholder: "Was macht der Wettbewerber gut?", multiline: true, rows: 3 },
    { key: "weaknesses", label: "Schwächen", placeholder: "Wo hat er Defizite?", multiline: true, rows: 3 },
    { key: "positioning", label: "Positionierung", placeholder: "Wie positioniert er sich im Markt?", multiline: true, rows: 2 },
    { key: "differentiator", label: "Unser Differenzierungsmerkmal", placeholder: "Womit unterscheiden wir uns?", multiline: true, rows: 2 },
  ],

  RESEARCH_FINDING: [
    { key: "insight", label: "Kernaussage / Insight", placeholder: "Was haben wir herausgefunden?", multiline: true, rows: 3 },
    { key: "method", label: "Forschungsmethode", placeholder: "z. B. Interview, Survey, Usability-Test", multiline: false },
    { key: "participants", label: "Teilnehmer / Sample", placeholder: "z. B. 12 Nutzerinterviews, B2B-Segment", multiline: false },
    { key: "implications", label: "Implikationen fürs Produkt", placeholder: "Was bedeutet das für uns?", multiline: true, rows: 3 },
  ],

  PROBLEM_STATEMENT: [
    { key: "problem", label: "Problem", placeholder: "Welches Problem existiert?", multiline: true, rows: 3 },
    { key: "context", label: "Kontext", placeholder: "In welchem Kontext tritt das Problem auf?", multiline: true, rows: 2 },
    { key: "impact", label: "Auswirkung", placeholder: "Wie stark betrifft das Problem Nutzer oder Business?", multiline: true, rows: 2 },
    { key: "currentSolution", label: "Aktuelle Lösung / Workaround", placeholder: "Wie wird das Problem heute gelöst?", multiline: true, rows: 2 },
  ],

  OPPORTUNITY: [
    { key: "description", label: "Beschreibung der Opportunity", placeholder: "Welche Chance haben wir?", multiline: true, rows: 3 },
    { key: "potentialValue", label: "Potenzieller Wert", placeholder: "Welchen Business- oder Nutzerwert hat das?", multiline: true, rows: 2 },
    { key: "timeToMarket", label: "Zeitliche Einschätzung", placeholder: "Wann ist die Gelegenheit relevant?", multiline: false },
  ],

  HYPOTHESIS: [
    { key: "assumption", label: "Annahme", placeholder: "Wir glauben, dass…", multiline: true, rows: 2 },
    { key: "rationale", label: "Begründung", placeholder: "Warum glauben wir das?", multiline: true, rows: 2 },
    { key: "testMethod", label: "Testmethode", placeholder: "Wie testen wir die Annahme?", multiline: true, rows: 2 },
    { key: "successCriteria", label: "Erfolgskriterium", placeholder: "Wann gilt die Annahme als bestätigt?", multiline: true, rows: 2 },
  ],

  // Legacy
  PROBLEM_HYPOTHESIS: [
    { key: "problem", label: "Problem", placeholder: "Welches Problem besteht?", multiline: true, rows: 3 },
    { key: "targetAudience", label: "Zielgruppe", placeholder: "Wen betrifft das Problem?", multiline: false },
    { key: "assumption", label: "Annahme", placeholder: "Was nehmen wir an?", multiline: true, rows: 3 },
    { key: "validation", label: "Validierungsansatz", placeholder: "Wie validieren wir diese Annahme?", multiline: true, rows: 3 },
  ],

  // ─── Audience ───

  USER_PERSONA: [
    { key: "name", label: "Name der Persona", placeholder: "z. B. Max Müller", multiline: false },
    { key: "goals", label: "Ziele", placeholder: "Was möchte die Person erreichen?", multiline: true, rows: 3 },
    { key: "painPoints", label: "Pain Points", placeholder: "Welche Probleme hat die Person?", multiline: true, rows: 3 },
    { key: "context", label: "Kontext / Hintergrund", placeholder: "Beruf, Alter, Situation…", multiline: true, rows: 3 },
  ],

  BUYER_PERSONA: [
    { key: "name", label: "Name der Buyer Persona", placeholder: "z. B. IT-Einkäufer Mittelstand", multiline: false },
    { key: "role", label: "Rolle / Position", placeholder: "z. B. CTO, Einkaufsleiter", multiline: false },
    { key: "goals", label: "Geschäftliche Ziele", placeholder: "Was will er/sie im Unternehmen erreichen?", multiline: true, rows: 3 },
    { key: "painPoints", label: "Pain Points", placeholder: "Was sind die größten Herausforderungen?", multiline: true, rows: 3 },
    { key: "buyingCriteria", label: "Kaufkriterien", placeholder: "Worauf legt er/sie beim Kauf Wert?", multiline: true, rows: 3 },
  ],

  // ─── Strategy ───

  PRODUCT_VISION: [
    { key: "oneLiner", label: "Einzeiler / Elevator Pitch", placeholder: "Das Produkt in einem Satz", multiline: false },
  ],

  VALUE_PROPOSITION: [
    { key: "statement", label: "Value Proposition Statement", placeholder: "Wir helfen [Zielgruppe] dabei, [Problem] zu lösen, indem wir [Lösung] anbieten.", multiline: true, rows: 3 },
    { key: "keyBenefit", label: "Hauptnutzen", placeholder: "Was ist der wichtigste Vorteil?", multiline: true, rows: 2 },
    { key: "differentiator", label: "Differenzierungsmerkmal", placeholder: "Was unterscheidet uns von Alternativen?", multiline: true, rows: 2 },
  ],

  POSITIONING: [
    { key: "statement", label: "Positionierungsaussage", placeholder: "Für [Zielgruppe], die [Bedürfnis], ist [Produkt] die [Kategorie], die [Differenzierungsmerkmal].", multiline: true, rows: 3 },
    { key: "competitiveAdvantage", label: "Wettbewerbsvorteil", placeholder: "Unser nachhaltiger Vorteil gegenüber Wettbewerbern", multiline: true, rows: 3 },
    { key: "keyMessage", label: "Kernbotschaft", placeholder: "Die eine Botschaft, die hängen bleibt", multiline: false },
  ],

  BUSINESS_MODEL: [
    { key: "revenueStreams", label: "Einnahmequellen", placeholder: "Wie verdienen wir Geld? (Abo, Lizenz, Transaktion…)", multiline: true, rows: 3 },
    { key: "costStructure", label: "Kostenstruktur", placeholder: "Hauptkosten: Entwicklung, Support, Infrastruktur…", multiline: true, rows: 3 },
    { key: "channels", label: "Vertriebskanäle", placeholder: "Wie erreichen wir Kunden?", multiline: true, rows: 2 },
    { key: "keyPartners", label: "Wichtige Partner", placeholder: "Wer sind unsere Schlüsselpartner?", multiline: true, rows: 2 },
  ],

  KPI_OKR: [
    { key: "objective", label: "Objective / Ziel", placeholder: "Was wollen wir erreichen?", multiline: true, rows: 2 },
    { key: "keyResults", label: "Key Results", placeholder: "KR1: …\nKR2: …\nKR3: …", multiline: true, rows: 4 },
    { key: "metrics", label: "Metriken / KPIs", placeholder: "Welche Kennzahlen messen wir?", multiline: true, rows: 3 },
    { key: "timeframe", label: "Zeitraum", placeholder: "z. B. Q1 2025", multiline: false },
    { key: "owner", label: "Verantwortlicher", placeholder: "Wer ist für dieses OKR zuständig?", multiline: false },
  ],

  // ─── Discovery & Design ───

  USE_CASE: [
    { key: "goal", label: "Ziel", placeholder: "Was möchte der Akteur erreichen?", multiline: false },
    { key: "flow", label: "Ablauf", placeholder: "1. Schritt\n2. Schritt\n…", multiline: true, rows: 6 },
    { key: "preconditions", label: "Vorbedingungen", placeholder: "Was muss vorher erfüllt sein?", multiline: true, rows: 2 },
  ],

  USER_JOURNEY: [
    { key: "scenario", label: "Szenario", placeholder: "In welcher Situation befinden wir uns?", multiline: true, rows: 2 },
    { key: "steps", label: "Journey-Schritte", placeholder: "1. Schritt: Aktion — Gedanken — Gefühl\n2. Schritt: …", multiline: true, rows: 8 },
    { key: "painPoints", label: "Pain Points in der Journey", placeholder: "Wo entstehen Reibung oder Frustration?", multiline: true, rows: 3 },
    { key: "opportunities", label: "Verbesserungspotenziale", placeholder: "Wo können wir die Erfahrung verbessern?", multiline: true, rows: 3 },
  ],

  FEATURE: [
    { key: "description", label: "Beschreibung", placeholder: "Was macht dieses Feature?", multiline: true, rows: 3 },
    { key: "userValue", label: "Nutzen für den User", placeholder: "Welchen Wert bringt es dem Nutzer?", multiline: true, rows: 2 },
    { key: "inScope", label: "Im Scope", placeholder: "Was ist explizit enthalten?", multiline: true, rows: 3 },
    { key: "outOfScope", label: "Nicht im Scope", placeholder: "Was ist explizit ausgeschlossen?", multiline: true, rows: 2 },
    { key: "priority", label: "Priorität", placeholder: "Hoch / Mittel / Niedrig — Begründung", multiline: false },
  ],

  EPIC: [
    { key: "description", label: "Beschreibung", placeholder: "Was umfasst dieses Epic?", multiline: true, rows: 3 },
    { key: "goals", label: "Ziele", placeholder: "Was soll mit diesem Epic erreicht werden?", multiline: true, rows: 3 },
    { key: "scope", label: "Scope", placeholder: "Was ist enthalten, was nicht?", multiline: true, rows: 3 },
    { key: "successCriteria", label: "Erfolgskriterien", placeholder: "Wann gilt das Epic als abgeschlossen?", multiline: true, rows: 3 },
  ],

  // ─── Delivery ───

  USER_STORY: [
    { key: "action", label: "möchte ich … (Aktion)", placeholder: "z. B. meine Geräte per App steuern", multiline: true, rows: 2 },
    { key: "benefit", label: "damit … (Nutzen)", placeholder: "z. B. ich Energie spare", multiline: true, rows: 2 },
  ],

  FUNCTIONAL_REQUIREMENT: [
    { key: "description", label: "Beschreibung", placeholder: "Was muss das System tun?", multiline: true, rows: 4 },
    { key: "acceptanceCriteria", label: "Akzeptanzkriterien", placeholder: "- Kriterium 1\n- Kriterium 2\n…", multiline: true, rows: 5 },
  ],

  NON_FUNCTIONAL_REQUIREMENT: [
    { key: "description", label: "Beschreibung", placeholder: "Welche nicht-funktionale Eigenschaft ist gefordert?", multiline: true, rows: 3 },
    { key: "category", label: "Kategorie", placeholder: "Performance / Sicherheit / Zuverlässigkeit / Skalierbarkeit / Usability…", multiline: false },
    { key: "metric", label: "Messbare Metrik", placeholder: "z. B. Antwortzeit < 200 ms bei 1000 gleichzeitigen Nutzern", multiline: false },
    { key: "acceptanceCriteria", label: "Akzeptanzkriterien", placeholder: "Wann gilt die Anforderung als erfüllt?", multiline: true, rows: 3 },
  ],

  ACCEPTANCE_CRITERIA: [
    { key: "scenario", label: "Szenario (Given / When / Then)", placeholder: "Given [Voraussetzung]\nWhen [Aktion]\nThen [Erwartetes Ergebnis]", multiline: true, rows: 5 },
    { key: "preconditions", label: "Vorbedingungen", placeholder: "Was muss vor dem Test erfüllt sein?", multiline: true, rows: 2 },
    { key: "expectedResult", label: "Erwartetes Ergebnis", placeholder: "Was soll nach der Aktion passieren?", multiline: true, rows: 3 },
  ],

  DEPENDENCY: [
    { key: "description", label: "Beschreibung der Abhängigkeit", placeholder: "Was hängt von was ab?", multiline: true, rows: 3 },
    { key: "dependsOn", label: "Abhängig von", placeholder: "Team, System, Feature oder externem Partner", multiline: false },
    { key: "type", label: "Typ", placeholder: "Intern / Extern / Technisch / Organisatorisch", multiline: false },
    { key: "impact", label: "Auswirkung bei Nicht-Erfüllung", placeholder: "Was passiert, wenn die Abhängigkeit nicht gelöst wird?", multiline: true, rows: 2 },
    { key: "owner", label: "Verantwortlicher", placeholder: "Wer löst die Abhängigkeit?", multiline: false },
  ],

  RISK: [
    { key: "description", label: "Risikobeschreibung", placeholder: "Was könnte schiefgehen?", multiline: true, rows: 3 },
    { key: "probability", label: "Wahrscheinlichkeit", placeholder: "Hoch / Mittel / Niedrig", multiline: false },
    { key: "impact", label: "Auswirkung", placeholder: "Hoch / Mittel / Niedrig — Begründung", multiline: true, rows: 2 },
    { key: "mitigation", label: "Mitigationsstrategie", placeholder: "Wie reduzieren oder verhindern wir das Risiko?", multiline: true, rows: 3 },
    { key: "owner", label: "Verantwortlicher", placeholder: "Wer überwacht dieses Risiko?", multiline: false },
  ],

  DECISION: [
    { key: "context", label: "Kontext / Hintergrund", placeholder: "Warum musste eine Entscheidung getroffen werden?", multiline: true, rows: 3 },
    { key: "decision", label: "Getroffene Entscheidung", placeholder: "Was wurde entschieden?", multiline: true, rows: 2 },
    { key: "rationale", label: "Begründung", placeholder: "Warum wurde so entschieden?", multiline: true, rows: 3 },
    { key: "alternatives", label: "Verworfene Alternativen", placeholder: "Welche Optionen wurden nicht gewählt und warum?", multiline: true, rows: 3 },
    { key: "consequences", label: "Konsequenzen", placeholder: "Welche Auswirkungen hat die Entscheidung?", multiline: true, rows: 2 },
  ],

  // ─── Planning & Release ───

  ROADMAP_ITEM: [
    { key: "description", label: "Beschreibung", placeholder: "Was ist geplant?", multiline: true, rows: 3 },
    { key: "timeframe", label: "Zeitraum / Quartal", placeholder: "z. B. Q2 2025, H2 2025, Now/Next/Later", multiline: false },
    { key: "relatedFeatures", label: "Verknüpfte Features / Epics", placeholder: "Welche Features sind Teil dieses Roadmap-Eintrags?", multiline: true, rows: 2 },
    { key: "rationale", label: "Begründung / strategische Relevanz", placeholder: "Warum ist das jetzt auf der Roadmap?", multiline: true, rows: 2 },
  ],

  RELEASE: [
    { key: "version", label: "Version", placeholder: "z. B. 1.0.0, v2.3", multiline: false },
    { key: "description", label: "Beschreibung", placeholder: "Was wird in diesem Release ausgeliefert?", multiline: true, rows: 3 },
    { key: "targetDate", label: "Zieldatum", placeholder: "z. B. 15. März 2025", multiline: false },
    { key: "scope", label: "Scope / Enthaltene Features", placeholder: "- Feature A\n- Feature B\n…", multiline: true, rows: 4 },
    { key: "releaseNotes", label: "Release Notes", placeholder: "Was ändert sich für den Nutzer?", multiline: true, rows: 4 },
  ],

  LAUNCH_TASK: [
    { key: "description", label: "Aufgabenbeschreibung", placeholder: "Was muss für den Launch erledigt werden?", multiline: true, rows: 3 },
    { key: "owner", label: "Verantwortlicher", placeholder: "Wer ist zuständig?", multiline: false },
    { key: "dueDate", label: "Fälligkeitsdatum", placeholder: "z. B. 1 Woche vor Launch", multiline: false },
    { key: "checklist", label: "Checkliste", placeholder: "- [ ] Schritt 1\n- [ ] Schritt 2\n…", multiline: true, rows: 4 },
  ],

  // ─── Feedback & Iteration ───

  FEEDBACK_ITEM: [
    { key: "source", label: "Quelle", placeholder: "Nutzer-Interview / Support-Ticket / NPS / Analytics…", multiline: false },
    { key: "content", label: "Feedback-Inhalt", placeholder: "Was wurde gesagt oder beobachtet?", multiline: true, rows: 4 },
    { key: "sentiment", label: "Bewertung / Sentiment", placeholder: "Positiv / Negativ / Neutral", multiline: false },
    { key: "actionItems", label: "Maßnahmen", placeholder: "Was leiten wir daraus ab?", multiline: true, rows: 3 },
  ],

  ITERATION: [
    { key: "description", label: "Beschreibung der Iteration", placeholder: "Was war Gegenstand dieser Iteration?", multiline: true, rows: 2 },
    { key: "learnings", label: "Learnings", placeholder: "Was haben wir gelernt?", multiline: true, rows: 4 },
    { key: "improvements", label: "Verbesserungsmaßnahmen", placeholder: "Was ändern wir konkret?", multiline: true, rows: 3 },
    { key: "nextSteps", label: "Nächste Schritte", placeholder: "Was machen wir als nächstes?", multiline: true, rows: 3 },
  ],
};

/** Returns default empty fields object for a given artifact type */
export function getDefaultFields(type) {
  const defs = ARTIFACT_FIELD_DEFS[type] ?? [];
  return Object.fromEntries(defs.map((f) => [f.key, ""]));
}
