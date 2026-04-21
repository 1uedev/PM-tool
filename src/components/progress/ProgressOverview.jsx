import { CheckCircle2, AlertTriangle, BarChart3 } from "lucide-react";
import PhaseCard from "./PhaseCard.jsx";

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
                <span className="font-semibold">{missingTypes}</span> Phasen ohne Artefakte
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

      {/* Phase grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {phases.map((phase) => (
          <PhaseCard key={phase.type} phase={phase} projectId={projectId} />
        ))}
      </div>
    </div>
  );
}
