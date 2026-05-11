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
  // Foundations
  GOALS_NON_GOALS: "GOALS_NON_GOALS",
  STAKEHOLDER: "STAKEHOLDER",
  ASSUMPTION: "ASSUMPTION",
  CONSTRAINT: "CONSTRAINT",
  OPEN_QUESTION: "OPEN_QUESTION",
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
  MEASUREMENT_PLAN: "MEASUREMENT_PLAN",
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
  TEST_PLAN: "TEST_PLAN",
  COMPLIANCE_REQUIREMENT: "COMPLIANCE_REQUIREMENT",
  // Planning & Release
  ROADMAP_ITEM: "ROADMAP_ITEM",
  RELEASE: "RELEASE",
  LAUNCH_TASK: "LAUNCH_TASK",
  MILESTONE: "MILESTONE",
  // Feedback & Iteration
  FEEDBACK_ITEM: "FEEDBACK_ITEM",
  ITERATION: "ITERATION",
};

export const ARTIFACT_TYPE_LABELS = {
  // Foundations
  GOALS_NON_GOALS: "Ziele & Nicht-Ziele",
  STAKEHOLDER: "Stakeholder",
  ASSUMPTION: "Annahme",
  CONSTRAINT: "Rahmenbedingung",
  OPEN_QUESTION: "Offene Frage",
  // Research
  MARKET_ANALYSIS: "Marktanalyse",
  COMPETITOR: "Wettbewerber",
  RESEARCH_FINDING: "Forschungsergebnis",
  PROBLEM_STATEMENT: "Problemstellung",
  OPPORTUNITY: "Chance",
  HYPOTHESIS: "Hypothese",
  PROBLEM_HYPOTHESIS: "Problemhypothese",
  // Audience
  USER_PERSONA: "Nutzer-Persona",
  BUYER_PERSONA: "Käufer-Persona",
  // Strategy
  PRODUCT_VISION: "Produktvision",
  VALUE_PROPOSITION: "Wertversprechen",
  POSITIONING: "Positionierung",
  BUSINESS_MODEL: "Geschäftsmodell",
  KPI_OKR: "KPI / OKR",
  MEASUREMENT_PLAN: "Messplan",
  // Discovery & Design
  USE_CASE: "Anwendungsfall",
  USER_JOURNEY: "User Journey",
  FEATURE: "Feature",
  EPIC: "Epic",
  // Delivery
  USER_STORY: "User Story",
  FUNCTIONAL_REQUIREMENT: "Funktionale Anforderung",
  NON_FUNCTIONAL_REQUIREMENT: "Nichtfunktionale Anforderung",
  ACCEPTANCE_CRITERIA: "Abnahmekriterien",
  DEPENDENCY: "Abhängigkeit",
  RISK: "Risiko",
  DECISION: "Entscheidung",
  TEST_PLAN: "Testplan",
  COMPLIANCE_REQUIREMENT: "Compliance-Anforderung",
  // Planning & Release
  ROADMAP_ITEM: "Roadmap-Eintrag",
  RELEASE: "Release",
  LAUNCH_TASK: "Launch-Aufgabe",
  MILESTONE: "Meilenstein",
  // Feedback & Iteration
  FEEDBACK_ITEM: "Feedback",
  ITERATION: "Iteration",
};

// ─── Explorer Navigator Groups ───

// Color accent per group — used in explorer, traceability, progress
export const ARTIFACT_GROUP_COLORS = {
  foundations: { bg: "bg-slate-100",  text: "text-slate-700",  dot: "bg-slate-400",  border: "border-slate-200",  header: "bg-slate-100 text-slate-800",  badge: "bg-slate-50 border-slate-200 text-slate-700" },
  research:    { bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-400", border: "border-violet-200", header: "bg-violet-100 text-violet-800", badge: "bg-violet-50 border-violet-200 text-violet-700" },
  audience:    { bg: "bg-pink-100",   text: "text-pink-700",   dot: "bg-pink-400",   border: "border-pink-200",   header: "bg-pink-100 text-pink-800",     badge: "bg-pink-50 border-pink-200 text-pink-700" },
  strategy:    { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-400",   border: "border-blue-200",   header: "bg-blue-100 text-blue-800",     badge: "bg-blue-50 border-blue-200 text-blue-700" },
  discovery:   { bg: "bg-cyan-100",   text: "text-cyan-700",   dot: "bg-cyan-400",   border: "border-cyan-200",   header: "bg-cyan-100 text-cyan-800",     badge: "bg-cyan-50 border-cyan-200 text-cyan-700" },
  delivery:    { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-400",  border: "border-green-200",  header: "bg-green-100 text-green-800",   badge: "bg-green-50 border-green-200 text-green-700" },
  planning:    { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400", border: "border-orange-200", header: "bg-orange-100 text-orange-800", badge: "bg-orange-50 border-orange-200 text-orange-700" },
  feedback:    { bg: "bg-rose-100",   text: "text-rose-700",   dot: "bg-rose-400",   border: "border-rose-200",   header: "bg-rose-100 text-rose-800",     badge: "bg-rose-50 border-rose-200 text-rose-700" },
};

export const ARTIFACT_GROUPS = [
  {
    key: "foundations",
    label: "Grundlagen",
    types: [
      "GOALS_NON_GOALS",
      "STAKEHOLDER",
      "ASSUMPTION",
      "CONSTRAINT",
      "OPEN_QUESTION",
    ],
  },
  {
    key: "research",
    label: "Recherche",
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
    label: "Zielgruppe",
    types: ["USER_PERSONA", "BUYER_PERSONA"],
  },
  {
    key: "strategy",
    label: "Strategie",
    types: [
      "PRODUCT_VISION",
      "VALUE_PROPOSITION",
      "POSITIONING",
      "BUSINESS_MODEL",
      "KPI_OKR",
      "MEASUREMENT_PLAN",
    ],
  },
  {
    key: "discovery",
    label: "Discovery & Gestaltung",
    types: ["USE_CASE", "USER_JOURNEY", "FEATURE", "EPIC"],
  },
  {
    key: "delivery",
    label: "Lieferung",
    types: [
      "USER_STORY",
      "FUNCTIONAL_REQUIREMENT",
      "NON_FUNCTIONAL_REQUIREMENT",
      "ACCEPTANCE_CRITERIA",
      "DEPENDENCY",
      "RISK",
      "DECISION",
      "TEST_PLAN",
      "COMPLIANCE_REQUIREMENT",
    ],
  },
  {
    key: "planning",
    label: "Planung & Release",
    types: ["ROADMAP_ITEM", "RELEASE", "LAUNCH_TASK", "MILESTONE"],
  },
  {
    key: "feedback",
    label: "Feedback & Iteration", // kept as-is — same in German
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

// Smart relation type suggestions: RELATION_SUGGESTIONS[sourceType][targetType] = recommended type
export const RELATION_SUGGESTIONS = {
  // Foundations
  GOALS_NON_GOALS: {
    PRODUCT_VISION: "DERIVES_FROM", KPI_OKR: "RELATES_TO",
    EPIC: "RELATES_TO", ROADMAP_ITEM: "RELATES_TO", MEASUREMENT_PLAN: "RELATES_TO",
  },
  STAKEHOLDER: {
    GOALS_NON_GOALS: "RELATES_TO", EPIC: "RELATES_TO", RISK: "RELATES_TO",
    DECISION: "RELATES_TO", MILESTONE: "RELATES_TO",
  },
  ASSUMPTION: {
    RISK: "RELATES_TO", HYPOTHESIS: "RELATES_TO", GOALS_NON_GOALS: "RELATES_TO",
    PRODUCT_VISION: "RELATES_TO", CONSTRAINT: "RELATES_TO",
  },
  CONSTRAINT: {
    GOALS_NON_GOALS: "RELATES_TO", RISK: "RELATES_TO",
    NON_FUNCTIONAL_REQUIREMENT: "RELATES_TO", ROADMAP_ITEM: "RELATES_TO",
  },
  OPEN_QUESTION: {
    DECISION: "RELATES_TO", RISK: "RELATES_TO", ASSUMPTION: "RELATES_TO",
    GOALS_NON_GOALS: "RELATES_TO", EPIC: "RELATES_TO",
  },
  // Research
  MARKET_ANALYSIS: {
    USER_PERSONA: "RELATES_TO", BUYER_PERSONA: "RELATES_TO",
    COMPETITOR: "RELATES_TO", OPPORTUNITY: "RELATES_TO", PROBLEM_STATEMENT: "RELATES_TO",
  },
  RESEARCH_FINDING: {
    HYPOTHESIS: "VALIDATES", PROBLEM_HYPOTHESIS: "VALIDATES",
    USER_PERSONA: "RELATES_TO", OPPORTUNITY: "RELATES_TO", PROBLEM_STATEMENT: "RELATES_TO",
    ASSUMPTION: "VALIDATES",
  },
  PROBLEM_STATEMENT: {
    HYPOTHESIS: "DERIVES_FROM", PROBLEM_HYPOTHESIS: "DERIVES_FROM",
    OPPORTUNITY: "RELATES_TO", PRODUCT_VISION: "RELATES_TO",
    GOALS_NON_GOALS: "RELATES_TO",
  },
  OPPORTUNITY: {
    PRODUCT_VISION: "DERIVES_FROM", HYPOTHESIS: "RELATES_TO",
    FEATURE: "RELATES_TO", EPIC: "RELATES_TO", GOALS_NON_GOALS: "RELATES_TO",
  },
  HYPOTHESIS: {
    PRODUCT_VISION: "VALIDATES", VALUE_PROPOSITION: "RELATES_TO",
    RESEARCH_FINDING: "VALIDATES", ASSUMPTION: "RELATES_TO",
  },
  PROBLEM_HYPOTHESIS: {
    PRODUCT_VISION: "VALIDATES", USER_PERSONA: "RELATES_TO",
    RESEARCH_FINDING: "VALIDATES",
  },
  // Audience
  USER_PERSONA: {
    USE_CASE: "RELATES_TO", USER_JOURNEY: "RELATES_TO",
    USER_STORY: "RELATES_TO", VALUE_PROPOSITION: "RELATES_TO",
    GOALS_NON_GOALS: "RELATES_TO",
  },
  BUYER_PERSONA: {
    VALUE_PROPOSITION: "RELATES_TO", POSITIONING: "RELATES_TO",
    GOALS_NON_GOALS: "RELATES_TO",
  },
  // Strategy
  PRODUCT_VISION: {
    EPIC: "DERIVES_FROM", FEATURE: "DERIVES_FROM",
    KPI_OKR: "DERIVES_FROM", ROADMAP_ITEM: "DERIVES_FROM",
    GOALS_NON_GOALS: "DERIVES_FROM", MEASUREMENT_PLAN: "RELATES_TO",
  },
  VALUE_PROPOSITION: {
    PRODUCT_VISION: "DERIVES_FROM", USER_PERSONA: "RELATES_TO", FEATURE: "RELATES_TO",
  },
  POSITIONING: {
    VALUE_PROPOSITION: "DERIVES_FROM", PRODUCT_VISION: "RELATES_TO",
  },
  BUSINESS_MODEL: {
    PRODUCT_VISION: "RELATES_TO", VALUE_PROPOSITION: "RELATES_TO",
  },
  KPI_OKR: {
    PRODUCT_VISION: "DERIVES_FROM", EPIC: "VALIDATES", ROADMAP_ITEM: "VALIDATES",
    MEASUREMENT_PLAN: "RELATES_TO", GOALS_NON_GOALS: "DERIVES_FROM",
  },
  MEASUREMENT_PLAN: {
    KPI_OKR: "DERIVES_FROM", GOALS_NON_GOALS: "DERIVES_FROM",
    PRODUCT_VISION: "RELATES_TO", ITERATION: "RELATES_TO",
  },
  // Discovery & Design
  EPIC: {
    USER_STORY: "DERIVES_FROM", FEATURE: "DEPENDS_ON", ROADMAP_ITEM: "RELATES_TO",
    KPI_OKR: "VALIDATES", GOALS_NON_GOALS: "RELATES_TO",
  },
  FEATURE: {
    EPIC: "DERIVES_FROM", USER_STORY: "DERIVES_FROM",
    FUNCTIONAL_REQUIREMENT: "DERIVES_FROM", PRODUCT_VISION: "DERIVES_FROM",
    GOALS_NON_GOALS: "RELATES_TO",
  },
  USE_CASE: {
    USER_STORY: "DERIVES_FROM", FUNCTIONAL_REQUIREMENT: "DERIVES_FROM",
    USER_PERSONA: "RELATES_TO",
  },
  USER_JOURNEY: {
    USER_STORY: "DERIVES_FROM", USE_CASE: "RELATES_TO", USER_PERSONA: "RELATES_TO",
  },
  // Delivery
  USER_STORY: {
    FUNCTIONAL_REQUIREMENT: "DERIVES_FROM", ACCEPTANCE_CRITERIA: "VALIDATES",
    EPIC: "DERIVES_FROM", DEPENDENCY: "DEPENDS_ON",
  },
  FUNCTIONAL_REQUIREMENT: {
    NON_FUNCTIONAL_REQUIREMENT: "RELATES_TO", ACCEPTANCE_CRITERIA: "VALIDATES",
    USER_STORY: "DERIVES_FROM",
  },
  NON_FUNCTIONAL_REQUIREMENT: {
    FUNCTIONAL_REQUIREMENT: "RELATES_TO", ACCEPTANCE_CRITERIA: "VALIDATES",
    COMPLIANCE_REQUIREMENT: "RELATES_TO", CONSTRAINT: "DERIVES_FROM",
  },
  ACCEPTANCE_CRITERIA: {
    USER_STORY: "VALIDATES", FUNCTIONAL_REQUIREMENT: "VALIDATES",
    TEST_PLAN: "RELATES_TO",
  },
  DEPENDENCY: {
    USER_STORY: "DEPENDS_ON", EPIC: "DEPENDS_ON", RELEASE: "DEPENDS_ON",
    MILESTONE: "DEPENDS_ON",
  },
  RISK: {
    DEPENDENCY: "RELATES_TO", EPIC: "RELATES_TO", RELEASE: "RELATES_TO",
    ASSUMPTION: "RELATES_TO", CONSTRAINT: "RELATES_TO", OPEN_QUESTION: "RELATES_TO",
  },
  DECISION: {
    EPIC: "RELATES_TO", FUNCTIONAL_REQUIREMENT: "RELATES_TO", RISK: "RELATES_TO",
    OPEN_QUESTION: "RELATES_TO", CONSTRAINT: "RELATES_TO",
  },
  TEST_PLAN: {
    ACCEPTANCE_CRITERIA: "VALIDATES", EPIC: "RELATES_TO", RELEASE: "DEPENDS_ON",
    COMPLIANCE_REQUIREMENT: "RELATES_TO",
  },
  COMPLIANCE_REQUIREMENT: {
    NON_FUNCTIONAL_REQUIREMENT: "RELATES_TO", FUNCTIONAL_REQUIREMENT: "RELATES_TO",
    RISK: "RELATES_TO", RELEASE: "DEPENDS_ON",
  },
  // Planning & Release
  ROADMAP_ITEM: {
    EPIC: "DEPENDS_ON", FEATURE: "DEPENDS_ON", RELEASE: "DERIVES_FROM",
    MILESTONE: "RELATES_TO", GOALS_NON_GOALS: "DERIVES_FROM",
  },
  RELEASE: {
    ROADMAP_ITEM: "DERIVES_FROM", LAUNCH_TASK: "DEPENDS_ON", USER_STORY: "RELATES_TO",
    MILESTONE: "DEPENDS_ON", TEST_PLAN: "DEPENDS_ON",
  },
  LAUNCH_TASK: {
    RELEASE: "DEPENDS_ON", FEATURE: "RELATES_TO", MILESTONE: "RELATES_TO",
  },
  MILESTONE: {
    ROADMAP_ITEM: "RELATES_TO", RELEASE: "RELATES_TO", EPIC: "RELATES_TO",
    DEPENDENCY: "DEPENDS_ON", GOALS_NON_GOALS: "RELATES_TO",
  },
  // Feedback & Iteration
  FEEDBACK_ITEM: {
    USER_STORY: "RELATES_TO", ITERATION: "DERIVES_FROM", FEATURE: "RELATES_TO",
  },
  ITERATION: {
    FEEDBACK_ITEM: "DERIVES_FROM", EPIC: "RELATES_TO", RELEASE: "RELATES_TO",
    MEASUREMENT_PLAN: "RELATES_TO",
  },
};

// ─── Marketing / Public Site ───

export const SITE = {
  name: "PM Copilot",
  description: "AI-powered product management for structured PRDs, traceability, and contextual AI assistance.",
};

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
