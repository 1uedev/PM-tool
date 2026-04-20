// Field definitions per artifact type.
// Each field: { key, label, placeholder, multiline, rows }
// Used by ArtifactForm and AI prompt templates.

export const ARTIFACT_FIELD_DEFS = {
  USER_PERSONA: [
    { key: "name", label: "Name der Persona", placeholder: "z. B. Max Müller", multiline: false },
    { key: "goals", label: "Ziele", placeholder: "Was möchte die Person erreichen?", multiline: true, rows: 3 },
    { key: "painPoints", label: "Pain Points", placeholder: "Welche Probleme hat die Person?", multiline: true, rows: 3 },
    { key: "context", label: "Kontext / Hintergrund", placeholder: "Beruf, Alter, Situation…", multiline: true, rows: 3 },
  ],
  PROBLEM_HYPOTHESIS: [
    { key: "problem", label: "Problem", placeholder: "Welches Problem besteht?", multiline: true, rows: 3 },
    { key: "targetAudience", label: "Zielgruppe", placeholder: "Wen betrifft das Problem?", multiline: false },
    { key: "assumption", label: "Annahme", placeholder: "Was nehmen wir an?", multiline: true, rows: 3 },
    { key: "validation", label: "Validierungsansatz", placeholder: "Wie validieren wir diese Annahme?", multiline: true, rows: 3 },
  ],
  PRODUCT_VISION: [
    { key: "oneLiner", label: "Einzeiler / Elevator Pitch", placeholder: "Das Produkt in einem Satz", multiline: false },
    { key: "targetUsers", label: "Zielnutzer", placeholder: "Für wen bauen wir das?", multiline: true, rows: 2 },
    { key: "valueProposition", label: "Nutzenversprechen", placeholder: "Welchen Wert bietet das Produkt?", multiline: true, rows: 4 },
  ],
  USE_CASE: [
    { key: "actor", label: "Akteur", placeholder: "Wer führt die Aktion aus?", multiline: false },
    { key: "goal", label: "Ziel", placeholder: "Was möchte der Akteur erreichen?", multiline: false },
    { key: "flow", label: "Ablauf", placeholder: "1. Schritt\n2. Schritt\n…", multiline: true, rows: 6 },
    { key: "preconditions", label: "Vorbedingungen", placeholder: "Was muss vorher erfüllt sein?", multiline: true, rows: 2 },
  ],
  USER_STORY: [
    { key: "role", label: "Als … (Rolle)", placeholder: "z. B. Hausbesitzer", multiline: false },
    { key: "action", label: "möchte ich … (Aktion)", placeholder: "z. B. meine Geräte per App steuern", multiline: true, rows: 2 },
    { key: "benefit", label: "damit … (Nutzen)", placeholder: "z. B. ich Energie spare", multiline: true, rows: 2 },
  ],
  FUNCTIONAL_REQUIREMENT: [
    { key: "description", label: "Beschreibung", placeholder: "Was muss das System tun?", multiline: true, rows: 4 },
    { key: "acceptanceCriteria", label: "Akzeptanzkriterien", placeholder: "- Kriterium 1\n- Kriterium 2\n…", multiline: true, rows: 5 },
  ],
};

/** Returns default empty fields object for a given artifact type */
export function getDefaultFields(type) {
  const defs = ARTIFACT_FIELD_DEFS[type] ?? [];
  return Object.fromEntries(defs.map((f) => [f.key, ""]));
}
