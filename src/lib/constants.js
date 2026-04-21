export const PROJECT_STATUS = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
};

export const PROJECT_ROLE = {
  OWNER: "OWNER",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
};

// ─── Artifact Types ───

export const ARTIFACT_TYPE = {
  // Research
  MARKET_ANALYSIS: "MARKET_ANALYSIS",
  COMPETITOR: "COMPETITOR",
  RESEARCH_FINDING: "RESEARCH_FINDING",
  PROBLEM_STATEMENT: "PROBLEM_STATEMENT",
  OPPORTUNITY: "OPPORTUNITY",
  HYPOTHESIS: "HYPOTHESIS",
  // Legacy (keep for backwards compatibility)
  PROBLEM_HYPOTHESIS: "PROBLEM_HYPOTHESIS",
  // Audience
  USER_PERSONA: "USER_PERSONA",
  BUYER_PERSONA: "BUYER_PERSONA",
  // Strategy
  PRODUCT_VISION: "PRODUCT_VISION",
  VALUE_PROPOSITION: "VALUE_PROPOSITION",
  POSITIONING: "POSITIONING",
  BUSINESS_MODEL: "BUSINESS_MODEL",
  KPI_OKR: "KPI_OKR",
  // Discovery & Design
  USE_CASE: "USE_CASE",
  USER_JOURNEY: "USER_JOURNEY",
  FEATURE: "FEATURE",
  EPIC: "EPIC",
  // Delivery
  USER_STORY: "USER_STORY",
  FUNCTIONAL_REQUIREMENT: "FUNCTIONAL_REQUIREMENT",
  NON_FUNCTIONAL_REQUIREMENT: "NON_FUNCTIONAL_REQUIREMENT",
  ACCEPTANCE_CRITERIA: "ACCEPTANCE_CRITERIA",
  DEPENDENCY: "DEPENDENCY",
  RISK: "RISK",
  DECISION: "DECISION",
  // Planning & Release
  ROADMAP_ITEM: "ROADMAP_ITEM",
  RELEASE: "RELEASE",
  LAUNCH_TASK: "LAUNCH_TASK",
  // Feedback & Iteration
  FEEDBACK_ITEM: "FEEDBACK_ITEM",
  ITERATION: "ITERATION",
};

export const ARTIFACT_TYPE_LABELS = {
  MARKET_ANALYSIS: "Marktanalyse",
  COMPETITOR: "Wettbewerber",
  RESEARCH_FINDING: "Research Finding",
  PROBLEM_STATEMENT: "Problem Statement",
  OPPORTUNITY: "Opportunity",
  HYPOTHESIS: "Hypothese",
  PROBLEM_HYPOTHESIS: "Problem-Hypothese",
  USER_PERSONA: "User Persona",
  BUYER_PERSONA: "Buyer Persona",
  PRODUCT_VISION: "Produktvision",
  VALUE_PROPOSITION: "Value Proposition",
  POSITIONING: "Positionierung",
  BUSINESS_MODEL: "Geschäftsmodell",
  KPI_OKR: "KPI / OKR",
  USE_CASE: "Use Case",
  USER_JOURNEY: "User Journey",
  FEATURE: "Feature",
  EPIC: "Epic",
  USER_STORY: "User Story",
  FUNCTIONAL_REQUIREMENT: "Funktionale Anforderung",
  NON_FUNCTIONAL_REQUIREMENT: "Nicht-funktionale Anforderung",
  ACCEPTANCE_CRITERIA: "Akzeptanzkriterien",
  DEPENDENCY: "Abhängigkeit",
  RISK: "Risiko",
  DECISION: "Entscheidung",
  ROADMAP_ITEM: "Roadmap Item",
  RELEASE: "Release",
  LAUNCH_TASK: "Launch Task",
  FEEDBACK_ITEM: "Feedback",
  ITERATION: "Iteration",
};

// ─── Explorer Navigator Groups ───
// Fachliche Gruppierung statt alphabetischer Reihenfolge

export const ARTIFACT_GROUPS = [
  {
    key: "research",
    label: "Research",
    types: [
      "MARKET_ANALYSIS",
      "COMPETITOR",
      "RESEARCH_FINDING",
      "PROBLEM_STATEMENT",
      "OPPORTUNITY",
      "HYPOTHESIS",
      "PROBLEM_HYPOTHESIS",
    ],
  },
  {
    key: "audience",
    label: "Audience",
    types: ["USER_PERSONA", "BUYER_PERSONA"],
  },
  {
    key: "strategy",
    label: "Strategy",
    types: [
      "PRODUCT_VISION",
      "VALUE_PROPOSITION",
      "POSITIONING",
      "BUSINESS_MODEL",
      "KPI_OKR",
    ],
  },
  {
    key: "discovery",
    label: "Discovery & Design",
    types: ["USE_CASE", "USER_JOURNEY", "FEATURE", "EPIC"],
  },
  {
    key: "delivery",
    label: "Delivery",
    types: [
      "USER_STORY",
      "FUNCTIONAL_REQUIREMENT",
      "NON_FUNCTIONAL_REQUIREMENT",
      "ACCEPTANCE_CRITERIA",
      "DEPENDENCY",
      "RISK",
      "DECISION",
    ],
  },
  {
    key: "planning",
    label: "Planning & Release",
    types: ["ROADMAP_ITEM", "RELEASE", "LAUNCH_TASK"],
  },
  {
    key: "feedback",
    label: "Feedback & Iteration",
    types: ["FEEDBACK_ITEM", "ITERATION"],
  },
];

// Flat canonical order for all types (used in progress, board, etc.)
export const ARTIFACT_TYPE_ORDER = ARTIFACT_GROUPS.flatMap((g) => g.types);

export const ARTIFACT_STATUS = {
  DRAFT: "DRAFT",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
};

export const ARTIFACT_STATUS_LABELS = {
  DRAFT: "Entwurf",
  IN_REVIEW: "In Prüfung",
  DONE: "Fertig",
};

export const RELATION_TYPE = {
  DERIVES_FROM: "DERIVES_FROM",
  DEPENDS_ON: "DEPENDS_ON",
  RELATES_TO: "RELATES_TO",
  VALIDATES: "VALIDATES",
};

export const RELATION_TYPE_LABELS = {
  DERIVES_FROM: "Abgeleitet von",
  DEPENDS_ON: "Abhängig von",
  RELATES_TO: "Verknüpft mit",
  VALIDATES: "Validiert",
};
