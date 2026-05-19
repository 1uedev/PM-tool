"use client";

import { useState } from "react";
import useSWR from "swr";
import ExplorerTree from "./ExplorerTree.jsx";
import BulkActionBar from "./BulkActionBar.jsx";
import { BulkSelectProvider, useBulkSelect } from "@/lib/BulkSelectContext.js";
import { useProjectRole } from "@/lib/ProjectRoleContext.js";
import { ARTIFACT_STATUS_LABELS } from "@/lib/constants.js";
import { CheckSquare, Square } from "lucide-react";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data ?? []);
const tagFetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data ?? []);

const STATUS_OPTIONS = [
  { value: "", label: "Alle" },
  { value: "DRAFT", label: ARTIFACT_STATUS_LABELS.DRAFT },
  { value: "IN_REVIEW", label: ARTIFACT_STATUS_LABELS.IN_REVIEW },
  { value: "DONE", label: ARTIFACT_STATUS_LABELS.DONE },
];

function TreeClientInner({ projectId, initialArtifacts }) {
  const [statusFilter, setStatusFilter] = useState("");
  const { selectMode, enter, clear } = useBulkSelect();
  const role = useProjectRole();
  const canEdit = role === "EDITOR" || role === "OWNER";

  const { data: artifacts } = useSWR(
    `/api/projects/${projectId}/artifacts`,
    fetcher,
    { fallbackData: initialArtifacts, revalidateOnFocus: false }
  );

  const { data: tags } = useSWR(
    canEdit ? `/api/projects/${projectId}/tags` : null,
    tagFetcher,
    { revalidateOnFocus: false }
  );

  const allArtifacts = artifacts ?? initialArtifacts;
  const filtered = statusFilter
    ? allArtifacts.filter((a) => a.status === statusFilter)
    : allArtifacts;

  return (
    <div className="flex flex-col h-full">
      {/* Filter + select-mode bar */}
      <div className="flex items-center gap-1 flex-wrap border-b border-gray-100 px-2 py-1.5">
        {!selectMode && STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`rounded-full px-2 py-0.5 text-xs transition-colors
              ${statusFilter === opt.value
                ? "bg-blue-100 font-medium text-blue-700"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
          >
            {opt.label}
          </button>
        ))}

        {canEdit && (
          <button
            onClick={selectMode ? clear : enter}
            aria-pressed={selectMode}
            className={`ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors
              ${selectMode
                ? "bg-blue-100 font-medium text-blue-700"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              }`}
          >
            {selectMode
              ? <CheckSquare className="h-3 w-3" aria-hidden="true" />
              : <Square className="h-3 w-3" aria-hidden="true" />
            }
            Auswählen
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <ExplorerTree artifacts={filtered} projectId={projectId} />
      </div>

      {selectMode && (
        <BulkActionBar projectId={projectId} tags={tags ?? []} />
      )}
    </div>
  );
}

export default function ExplorerTreeClient({ projectId, initialArtifacts }) {
  return (
    <BulkSelectProvider>
      <TreeClientInner projectId={projectId} initialArtifacts={initialArtifacts} />
    </BulkSelectProvider>
  );
}
