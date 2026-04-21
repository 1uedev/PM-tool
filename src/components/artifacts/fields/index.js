import UserPersonaFields from "./UserPersonaFields.jsx";
import ProblemHypothesisFields from "./ProblemHypothesisFields.jsx";
import ProductVisionFields from "./ProductVisionFields.jsx";
import UseCaseFields from "./UseCaseFields.jsx";
import UserStoryFields from "./UserStoryFields.jsx";
import FunctionalRequirementFields from "./FunctionalRequirementFields.jsx";

// New types — Schritt 5
import MarketAnalysisFields from "./MarketAnalysisFields.jsx";
import CompetitorFields from "./CompetitorFields.jsx";
import ResearchFindingFields from "./ResearchFindingFields.jsx";
import ProblemStatementFields from "./ProblemStatementFields.jsx";
import OpportunityFields from "./OpportunityFields.jsx";
import HypothesisFields from "./HypothesisFields.jsx";
import BuyerPersonaFields from "./BuyerPersonaFields.jsx";
import ValuePropositionFields from "./ValuePropositionFields.jsx";
import PositioningFields from "./PositioningFields.jsx";
import BusinessModelFields from "./BusinessModelFields.jsx";
import KpiOkrFields from "./KpiOkrFields.jsx";
import UserJourneyFields from "./UserJourneyFields.jsx";
import FeatureFields from "./FeatureFields.jsx";
import EpicFields from "./EpicFields.jsx";
import NonFunctionalRequirementFields from "./NonFunctionalRequirementFields.jsx";
import AcceptanceCriteriaFields from "./AcceptanceCriteriaFields.jsx";
import DependencyFields from "./DependencyFields.jsx";
import RiskFields from "./RiskFields.jsx";
import DecisionFields from "./DecisionFields.jsx";
import RoadmapItemFields from "./RoadmapItemFields.jsx";
import ReleaseFields from "./ReleaseFields.jsx";
import LaunchTaskFields from "./LaunchTaskFields.jsx";
import FeedbackItemFields from "./FeedbackItemFields.jsx";
import IterationFields from "./IterationFields.jsx";

export const FIELD_COMPONENTS = {
  // Legacy / original types
  USER_PERSONA: UserPersonaFields,
  PROBLEM_HYPOTHESIS: ProblemHypothesisFields,
  PRODUCT_VISION: ProductVisionFields,
  USE_CASE: UseCaseFields,
  USER_STORY: UserStoryFields,
  FUNCTIONAL_REQUIREMENT: FunctionalRequirementFields,

  // Research
  MARKET_ANALYSIS: MarketAnalysisFields,
  COMPETITOR: CompetitorFields,
  RESEARCH_FINDING: ResearchFindingFields,
  PROBLEM_STATEMENT: ProblemStatementFields,
  OPPORTUNITY: OpportunityFields,
  HYPOTHESIS: HypothesisFields,

  // Audience
  BUYER_PERSONA: BuyerPersonaFields,

  // Strategy
  VALUE_PROPOSITION: ValuePropositionFields,
  POSITIONING: PositioningFields,
  BUSINESS_MODEL: BusinessModelFields,
  KPI_OKR: KpiOkrFields,

  // Discovery & Design
  USER_JOURNEY: UserJourneyFields,
  FEATURE: FeatureFields,
  EPIC: EpicFields,

  // Delivery
  NON_FUNCTIONAL_REQUIREMENT: NonFunctionalRequirementFields,
  ACCEPTANCE_CRITERIA: AcceptanceCriteriaFields,
  DEPENDENCY: DependencyFields,
  RISK: RiskFields,
  DECISION: DecisionFields,

  // Planning & Release
  ROADMAP_ITEM: RoadmapItemFields,
  RELEASE: ReleaseFields,
  LAUNCH_TASK: LaunchTaskFields,

  // Feedback & Iteration
  FEEDBACK_ITEM: FeedbackItemFields,
  ITERATION: IterationFields,
};
