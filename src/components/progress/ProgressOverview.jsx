import { CheckCircle2, AlertTriangle, BarChart3 } from "lucide-react";
import PhaseCard from "./PhaseCard.jsx";
import { ARTIFACT_GROUPS, ARTIFACT_GROUP_COLORS } from "@/lib/constants.js";

function GroupSection({ group, phases, projectId }) {
  const groupPhases = phases.filter((p) => group.types.includes(p.type));
  const total = groupPhases.reduce((s, p) => s + p.total, 0);
  const done = groupPhases.reduce((s, p) => s + p.done, 0);
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const hasMissing = groupPhases.some((p) => p.missing);
  const colors = ARTIFACT_GROUP_COLORS[group.key] ?? {};

  return (
    <div>
      {/* Group header */}
      <div className={`mb-3 flex items-center justify-between rounded-lg border px-4 py-2.5 ${colors.bg ?? "bg-gray-50"} ${colors.border ?? "border-gray-200"}`}>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${colors.dot ?? "bg-gray-400"}`} />
          <span className={`text-sm font-semibold ${colors.text ?? "text-gray-700"}`}>{group.label}</span>
          {hasMissing && (
            <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
          )}
        </div>
        <div className="flex items-center gap-3">
          {total > 0 && (
            <>
              <span className="text-xs text-gray-500">{total} Artefakt{total !== 1 ? "e" : ""}</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${colors.text ?? "text-gray-600"}`}>{progress}%</span>
              </div>
            </>
          )}
          {total === 0 && (
            <span className="text-xs text-gray-400 italic">Keine Einträge</span>
          )}
        </div>
      </div>

      {/* Type cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
        {groupPhases.map((phase) => (
          <PhaseCard key={phase.type} phase={phase} projectId={projectId} />
        ))}
      </div>
    </div>
  );
}

export default function ProgressOverview({ data, projectId }) {
  const { phases, totalArtifacts, totalDone, overallProgress, missingTypes } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
            <p className="text-xs text-gray-500">Gesamtfortschritt</p>
          </div>
        </div>

        <div className="h-10 w-px bg-gray-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-700">
            <span className="font-semibold">{totalDone}</span> von {totalArtifacts} Artefakten fertig
          </span>
        </div>

        {missingTypes > 0 && (
          <>
            <div className="h-10 w-px bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-orange-700">
                <span className="font-semibold">{missingTypes}</span> Typen ohne Artefakte
              </span>
            </div>
          </>
        )}

        {/* Overall progress bar */}
        <div className="flex-1 min-w-40">
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phases grouped by fachliche Gruppe */}
      {ARTIFACT_GROUPS.map((group) => (
        <GroupSection
          key={group.key}
          group={group}
          phases={phases}
          projectId={projectId}
        />
      ))}
    </div>
  );
}
