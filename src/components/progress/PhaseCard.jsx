import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, FileText } from "lucide-react";
import { ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";

const STATUS_COLORS = {
  done: "bg-green-500",
  inReview: "bg-yellow-400",
  draft: "bg-gray-300",
};

export default function PhaseCard({ phase, projectId }) {
  const { type, total, done, inReview, draft, progress, missing } = phase;
  const label = ARTIFACT_TYPE_LABELS[type] ?? type;

  return (
    <div className={`flex flex-col gap-4 rounded-xl border p-5 bg-white shadow-sm transition-shadow hover:shadow-md
      ${missing ? "border-orange-200 bg-orange-50" : "border-gray-200"}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{label}</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            {missing ? "Noch keine Einträge" : `${total} Artefakt${total !== 1 ? "e" : ""}`}
          </p>
        </div>
        {missing ? (
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-400" />
        ) : progress === 100 ? (
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
        ) : (
          <FileText className="h-5 w-5 flex-shrink-0 text-gray-300" />
        )}
      </div>

      {/* Progress bar */}
      {!missing && (
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>Fortschritt</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status breakdown */}
      {!missing && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {done > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {done} Fertig
            </span>
          )}
          {inReview > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              {inReview} In Prüfung
            </span>
          )}
          {draft > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-gray-300" />
              {draft} Entwurf
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <Link
        href={`/projects/${projectId}?new=${type}`}
        className={`mt-auto self-start rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
          ${missing
            ? "border border-orange-300 bg-white text-orange-700 hover:bg-orange-100"
            : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
      >
        {missing ? "+ Ersten anlegen" : "+ Hinzufügen"}
      </Link>
    </div>
  );
}
