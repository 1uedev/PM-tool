"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import BoardColumn from "./BoardColumn.jsx";
import { ARTIFACT_GROUPS, ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";
import Spinner from "@/components/ui/Spinner.jsx";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((d) => d.data ?? []);

const COLUMNS = [
  { status: "DRAFT", label: "Entwurf", color: "bg-gray-400" },
  { status: "IN_REVIEW", label: "In Prüfung", color: "bg-yellow-400" },
  { status: "DONE", label: "Fertig", color: "bg-green-500" },
];

// Canonical type order for the filter, derived from groups
const TYPE_ORDER = ARTIFACT_GROUPS.flatMap((g) => g.types);

export default function BoardView({ projectId }) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState("");
  const [updating, setUpdating] = useState(null);

  const { data: artifacts = [], mutate } = useSWR(
    `/api/projects/${projectId}/artifacts`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Only offer types that actually have artifacts in the filter bar
  const presentTypes = TYPE_ORDER.filter((t) => artifacts.some((a) => a.type === t));

  const filtered = typeFilter ? artifacts.filter((a) => a.type === typeFilter) : artifacts;

  const byStatus = {
    DRAFT: filtered.filter((a) => a.status === "DRAFT"),
    IN_REVIEW: filtered.filter((a) => a.status === "IN_REVIEW"),
    DONE: filtered.filter((a) => a.status === "DONE"),
  };

  const handleDrop = useCallback(async (artifactId, newStatus) => {
    const artifact = artifacts.find((a) => a.id === artifactId);
    if (!artifact || artifact.status === newStatus) return;

    // Optimistic update
    mutate(
      artifacts.map((a) => (a.id === artifactId ? { ...a, status: newStatus } : a)),
      false
    );

    setUpdating(artifactId);
    try {
      const res = await fetch(`/api/projects/${projectId}/artifacts/${artifactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Rollback on error
        mutate();
      }
    } finally {
      setUpdating(null);
      mutate();
    }
  }, [artifacts, mutate, projectId]);

  function handleCardClick(artifactId) {
    router.push(`/projects/${projectId}?artifact=${artifactId}`);
  }

  if (!artifacts.length && artifacts !== undefined) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        Noch keine Artefakte — erstelle das erste im Explorer.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Typ:</span>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setTypeFilter("")}
            className={`rounded-full px-2 py-0.5 text-xs transition-colors
              ${!typeFilter ? "bg-blue-100 font-medium text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
          >
            Alle
          </button>
          {presentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type === typeFilter ? "" : type)}
              className={`rounded-full px-2 py-0.5 text-xs transition-colors
                ${typeFilter === type ? "bg-blue-100 font-medium text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              {ARTIFACT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        {updating && <Spinner className="h-4 w-4 ml-auto" />}
      </div>

      {/* Board columns */}
      <div className="flex flex-1 gap-4 overflow-x-auto p-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className="w-72 flex-shrink-0">
            <BoardColumn
              status={col.status}
              label={col.label}
              color={col.color}
              artifacts={byStatus[col.status]}
              onDrop={handleDrop}
              onCardClick={handleCardClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
