// Foundations
import { buildGoalsNonGoalsPrompt } from "./goals-non-goals.js";
import { buildStakeholderPrompt } from "./stakeholder.js";
import { buildAssumptionPrompt } from "./assumption.js";
import { buildConstraintPrompt } from "./constraint.js";
import { buildOpenQuestionPrompt } from "./open-question.js";

// Original 6 types
import { buildUserPersonaPrompt } from "./user-persona.js";
import { buildProblemHypothesisPrompt } from "./problem-hypothesis.js";
import { buildProductVisionPrompt } from "./product-vision.js";
import { buildUseCasePrompt } from "./use-case.js";
import { buildUserStoryPrompt } from "./user-story.js";
import { buildFunctionalRequirementPrompt } from "./functional-requirement.js";

// Research
import { buildMarketAnalysisPrompt } from "./market-analysis.js";
import { buildCompetitorPrompt } from "./competitor.js";
import { buildResearchFindingPrompt } from "./research-finding.js";
import { buildProblemStatementPrompt } from "./problem-statement.js";
import { buildOpportunityPrompt } from "./opportunity.js";
import { buildHypothesisPrompt } from "./hypothesis.js";

// Audience
import { buildBuyerPersonaPrompt } from "./buyer-persona.js";

// Strategy
import { buildValuePropositionPrompt } from "./value-proposition.js";
import { buildPositioningPrompt } from "./positioning.js";
import { buildBusinessModelPrompt } from "./business-model.js";
import { buildKpiOkrPrompt } from "./kpi-okr.js";
import { buildMeasurementPlanPrompt } from "./measurement-plan.js";

// Discovery & Design
import { buildUserJourneyPrompt } from "./user-journey.js";
import { buildFeaturePrompt } from "./feature.js";
import { buildEpicPrompt } from "./epic.js";

// Delivery
import { buildNonFunctionalRequirementPrompt } from "./non-functional-requirement.js";
import { buildAcceptanceCriteriaPrompt } from "./acceptance-criteria.js";
import { buildDependencyPrompt } from "./dependency.js";
import { buildRiskPrompt } from "./risk.js";
import { buildDecisionPrompt } from "./decision.js";
import { buildTestPlanPrompt } from "./test-plan.js";
import { buildComplianceRequirementPrompt } from "./compliance-requirement.js";

// Planning & Release
import { buildRoadmapItemPrompt } from "./roadmap-item.js";
import { buildReleasePrompt } from "./release.js";
import { buildLaunchTaskPrompt } from "./launch-task.js";
import { buildMilestonePrompt } from "./milestone.js";

// Feedback & Iteration
import { buildFeedbackItemPrompt } from "./feedback-item.js";
import { buildIterationPrompt } from "./iteration.js";

const PROMPT_BUILDERS = {
  // Foundations
  GOALS_NON_GOALS: buildGoalsNonGoalsPrompt,
  STAKEHOLDER: buildStakeholderPrompt,
  ASSUMPTION: buildAssumptionPrompt,
  CONSTRAINT: buildConstraintPrompt,
  OPEN_QUESTION: buildOpenQuestionPrompt,

  // Original types
  USER_PERSONA: buildUserPersonaPrompt,
  PROBLEM_HYPOTHESIS: buildProblemHypothesisPrompt,
  PRODUCT_VISION: buildProductVisionPrompt,
  USE_CASE: buildUseCasePrompt,
  USER_STORY: buildUserStoryPrompt,
  FUNCTIONAL_REQUIREMENT: buildFunctionalRequirementPrompt,

  // Research
  MARKET_ANALYSIS: buildMarketAnalysisPrompt,
  COMPETITOR: buildCompetitorPrompt,
  RESEARCH_FINDING: buildResearchFindingPrompt,
  PROBLEM_STATEMENT: buildProblemStatementPrompt,
  OPPORTUNITY: buildOpportunityPrompt,
  HYPOTHESIS: buildHypothesisPrompt,

  // Audience
  BUYER_PERSONA: buildBuyerPersonaPrompt,

  // Strategy
  VALUE_PROPOSITION: buildValuePropositionPrompt,
  POSITIONING: buildPositioningPrompt,
  BUSINESS_MODEL: buildBusinessModelPrompt,
  KPI_OKR: buildKpiOkrPrompt,
  MEASUREMENT_PLAN: buildMeasurementPlanPrompt,

  // Discovery & Design
  USER_JOURNEY: buildUserJourneyPrompt,
  FEATURE: buildFeaturePrompt,
  EPIC: buildEpicPrompt,

  // Delivery
  NON_FUNCTIONAL_REQUIREMENT: buildNonFunctionalRequirementPrompt,
  ACCEPTANCE_CRITERIA: buildAcceptanceCriteriaPrompt,
  DEPENDENCY: buildDependencyPrompt,
  RISK: buildRiskPrompt,
  DECISION: buildDecisionPrompt,
  TEST_PLAN: buildTestPlanPrompt,
  COMPLIANCE_REQUIREMENT: buildComplianceRequirementPrompt,

  // Planning & Release
  ROADMAP_ITEM: buildRoadmapItemPrompt,
  RELEASE: buildReleasePrompt,
  LAUNCH_TASK: buildLaunchTaskPrompt,
  MILESTONE: buildMilestonePrompt,

  // Feedback & Iteration
  FEEDBACK_ITEM: buildFeedbackItemPrompt,
  ITERATION: buildIterationPrompt,
};

/** Returns true if a prompt template exists for the given artifact type */
export function hasPromptBuilder(artifactType) {
  return Boolean(PROMPT_BUILDERS[artifactType]);
}

export function buildPrompt(artifactType, fields, context = "") {
  const builder = PROMPT_BUILDERS[artifactType];
  if (!builder) throw new Error(`No prompt builder for type: ${artifactType}`);
  return builder(fields, context);
}

// Parse the AI response into structured field suggestions.
// Returns { fields: {...} } or falls back to { raw: text } on parse failure.
export function parseSuggestions(text, artifactType) {
  try {
    // Extract JSON from response (model may wrap it in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);
    // Ensure all values are strings
    const fields = Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, String(v ?? "")])
    );
    return { fields };
  } catch {
    // Fallback: return raw text so UI can still show something
    return { raw: text };
  }
}
