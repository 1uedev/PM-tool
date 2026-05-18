import { ARTIFACT_GROUPS } from "@/lib/constants.js";
import ExplorerTreeGroup from "./ExplorerTreeGroup.jsx";
import ExplorerGroupSection from "./ExplorerGroupSection.jsx";

export default function ExplorerTree({ artifacts, projectId }) {
  // Index artifacts by type for fast lookup
  const byType = {};
  for (const a of artifacts) {
    if (!byType[a.type]) byType[a.type] = [];
    byType[a.type].push(a);
  }

  return (
    <nav className="flex flex-col gap-0.5 px-2 py-3" aria-label="Artefaktnavigation">
      {ARTIFACT_GROUPS.map((group) => (
        <ExplorerGroupSection
          key={group.key}
          group={group}
          byType={byType}
          projectId={projectId}
        />
      ))}
    </nav>
  );
}
