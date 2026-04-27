// The 10 minimum PRD starter questions

export const STARTER_QUESTIONS = [
  {
    key: "productIdea",
    number: 1,
    label: "What is the product idea?",
    hint: "One or two sentences.",
    placeholder: "Describe your product idea clearly and concisely.",
  },
  {
    key: "problemSolved",
    number: 2,
    label: "What problem does it solve?",
    hint: "The pain, inefficiency, risk, or opportunity.",
    placeholder: "What specific problem are you solving? Who feels it?",
  },
  {
    key: "targetUsers",
    number: 3,
    label: "Who has this problem?",
    hint: "Target users and, if different, target customers.",
    placeholder: "Describe the primary users and buyers. Are they the same person?",
  },
  {
    key: "currentSolution",
    number: 4,
    label: "How do users solve this problem today?",
    hint: "Manual process, spreadsheet, email, phone calls, existing software, etc.",
    placeholder: "What is the current workaround or status quo?",
  },
  {
    key: "whyInsufficient",
    number: 5,
    label: "Why is the current solution insufficient?",
    hint: "Too slow, expensive, unreliable, risky, not scalable, poor UX, etc.",
    placeholder: "What gap or failure in the current approach justifies building something new?",
  },
  {
    key: "desiredOutcome",
    number: 6,
    label: "What is the desired outcome?",
    hint: "What should become better after the product exists?",
    placeholder: "What measurable or observable improvement will the product deliver?",
  },
  {
    key: "firstUseCase",
    number: 7,
    label: "What is the first use case?",
    hint: "A concrete real-world scenario.",
    placeholder: "Describe a specific situation: who does what, when, and why?",
  },
  {
    key: "mustHaveFeatures",
    number: 8,
    label: "What are the must-have features for version 1?",
    hint: "Only the essential capabilities.",
    placeholder: "List only the features without which v1 cannot ship.",
  },
  {
    key: "outOfScope",
    number: 9,
    label: "What is out of scope for version 1?",
    hint: "This prevents the PRD from becoming too broad.",
    placeholder: "What are you explicitly NOT building in v1? Be specific.",
  },
  {
    key: "successMetrics",
    number: 10,
    label: "How will success be measured?",
    hint: "A metric, target, or observable behavior.",
    placeholder: "What number, event, or behavior will tell you v1 succeeded?",
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
