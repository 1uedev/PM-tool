import { ARTIFACT_TYPE } from "@/lib/constants.js";
import ExplorerTreeGroup from "./ExplorerTreeGroup.jsx";

// Canonical display order for artifact types
const TYPE_ORDER = [
  ARTIFACT_TYPE.USER_PERSONA,
  ARTIFACT_TYPE.PROBLEM_HYPOTHESIS,
  ARTIFACT_TYPE.PRODUCT_VISION,
  ARTIFACT_TYPE.USE_CASE,
  ARTIFACT_TYPE.USER_STORY,
  ARTIFACT_TYPE.FUNCTIONAL_REQUIREMENT,
];

export default function ExplorerTree({ artifacts, projectId }) {
  // Group artifacts by type
  const byType = Object.fromEntries(TYPE_ORDER.map((t) => [t, []]));
  for (const a of artifacts) {
    if (byType[a.type]) byType[a.type].push(a);
  }

  return (
    <nav className="flex flex-col gap-1 px-2 py-3">
      {TYPE_ORDER.map((type) => (
        <ExplorerTreeGroup
          key={type}
          type={type}
          artifacts={byType[type]}
          projectId={projectId}
        />
      ))}
    </nav>
  );
}
