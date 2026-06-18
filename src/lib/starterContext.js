// The 10 minimum PRD starter questions

export const STARTER_QUESTIONS = [
  {
    key: "productIdea",
    number: 1,
    label: "Was ist die Produktidee?",
    hint: "Ein bis zwei Sätze.",
    placeholder: "Beschreibe deine Produktidee klar und prägnant.",
  },
  {
    key: "problemSolved",
    number: 2,
    label: "Welches Problem löst es?",
    hint: "Der Schmerzpunkt, die Ineffizienz, das Risiko oder die Chance.",
    placeholder: "Welches konkrete Problem löst du? Wer ist davon betroffen?",
  },
  {
    key: "targetUsers",
    number: 3,
    label: "Wer hat dieses Problem?",
    hint: "Zielnutzer und, falls abweichend, Zielkunden.",
    placeholder: "Beschreibe die primären Nutzer und Käufer. Sind das dieselben Personen?",
  },
  {
    key: "currentSolution",
    number: 4,
    label: "Wie lösen Nutzer dieses Problem heute?",
    hint: "Manueller Prozess, Tabelle, E-Mail, Telefonate, bestehende Software usw.",
    placeholder: "Was ist die aktuelle Behelfslösung oder der Status quo?",
  },
  {
    key: "whyInsufficient",
    number: 5,
    label: "Warum ist die aktuelle Lösung unzureichend?",
    hint: "Zu langsam, zu teuer, unzuverlässig, riskant, nicht skalierbar, schlechte UX usw.",
    placeholder: "Welche Lücke oder welches Versagen im aktuellen Ansatz rechtfertigt etwas Neues?",
  },
  {
    key: "desiredOutcome",
    number: 6,
    label: "Was ist das gewünschte Ergebnis?",
    hint: "Was soll besser sein, wenn das Produkt existiert?",
    placeholder: "Welche messbare oder beobachtbare Verbesserung liefert das Produkt?",
  },
  {
    key: "firstUseCase",
    number: 7,
    label: "Was ist der erste Anwendungsfall?",
    hint: "Ein konkretes Szenario aus der Praxis.",
    placeholder: "Beschreibe eine konkrete Situation: Wer tut was, wann und warum?",
  },
  {
    key: "mustHaveFeatures",
    number: 8,
    label: "Welche Funktionen sind für Version 1 unverzichtbar?",
    hint: "Nur die essenziellen Fähigkeiten.",
    placeholder: "Liste nur die Funktionen, ohne die v1 nicht ausgeliefert werden kann.",
  },
  {
    key: "outOfScope",
    number: 9,
    label: "Was ist für Version 1 außerhalb des Umfangs?",
    hint: "Das verhindert, dass das PRD zu breit wird.",
    placeholder: "Was baust du in v1 ausdrücklich NICHT? Sei konkret.",
  },
  {
    key: "successMetrics",
    number: 10,
    label: "Wie wird Erfolg gemessen?",
    hint: "Eine Kennzahl, ein Zielwert oder ein beobachtbares Verhalten.",
    placeholder: "Welche Zahl, welches Ereignis oder Verhalten zeigt, dass v1 erfolgreich war?",
  },
];

// Which starter questions are relevant context for each artifact type
export const STARTER_ARTIFACT_CONTEXT = {
  PRODUCT_VISION:    ["productIdea"],
  PROBLEM_STATEMENT: ["problemSolved", "currentSolution", "whyInsufficient"],
  USER_PERSONA:      ["targetUsers"],
  BUYER_PERSONA:     ["targetUsers"],
  GOALS_NON_GOALS:   ["desiredOutcome", "outOfScope"],
  USE_CASE:          ["firstUseCase"],
  FEATURE:           ["mustHaveFeatures", "outOfScope"],
  EPIC:              ["mustHaveFeatures"],
  KPI_OKR:           ["successMetrics"],
  MEASUREMENT_PLAN:  ["successMetrics"],
};

// Which artifact types elaborate on each starter question (for the starter page)
export const STARTER_ARTIFACT_LINKS = {
  productIdea:       ["PRODUCT_VISION"],
  problemSolved:     ["PROBLEM_STATEMENT"],
  targetUsers:       ["USER_PERSONA", "BUYER_PERSONA"],
  currentSolution:   ["PROBLEM_STATEMENT"],
  whyInsufficient:   ["PROBLEM_STATEMENT"],
  desiredOutcome:    ["GOALS_NON_GOALS"],
  firstUseCase:      ["USE_CASE"],
  mustHaveFeatures:  ["FEATURE", "EPIC"],
  outOfScope:        ["GOALS_NON_GOALS"],
  successMetrics:    ["KPI_OKR", "MEASUREMENT_PLAN"],
};

export const STARTER_DEFAULTS = Object.fromEntries(
  STARTER_QUESTIONS.map((q) => [q.key, ""])
);
