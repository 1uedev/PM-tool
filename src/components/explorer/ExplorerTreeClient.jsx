"use client";

import { useState } from "react";
import useSWR from "swr";
import ExplorerTree from "./ExplorerTree.jsx";
import { ARTIFACT_STATUS_LABELS } from "@/lib/constants.js";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data ?? []);

const STATUS_OPTIONS = [
  { value: "", label: "Alle" },
  { value: "DRAFT", label: ARTIFACT_STATUS_LABELS.DRAFT },
  { value: "IN_REVIEW", label: ARTIFACT_STATUS_LABELS.IN_REVIEW },
  { value: "DONE", label: ARTIFACT_STATUS_LABELS.DONE },
];

export default function ExplorerTreeClient({ projectId, initialArtifacts }) {
  const [statusFilter, setStatusFilter] = useState("");

  const { data: artifacts } = useSWR(
    `/api/projects/${projectId}/artifacts`,
    fetcher,
    {
      fallbackData: initialArtifacts,
      revalidateOnFocus: false,
    }
  );

  const allArtifacts = artifacts ?? initialArtifacts;
  const filtered = statusFilter
    ? allArtifacts.filter((a) => a.status === statusFilter)
    : allArtifacts;

  return (
    <div className="flex flex-col h-full">
      {/* Status filter bar */}
      <div className="flex gap-1 flex-wrap border-b border-gray-100 px-2 py-1.5">
        {STATUS_OPTIONS.map((opt) => (
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
      </div>

      <div className="flex-1 overflow-y-auto">
        <ExplorerTree artifacts={filtered} projectId={projectId} />
      </div>
    </div>
  );
}
