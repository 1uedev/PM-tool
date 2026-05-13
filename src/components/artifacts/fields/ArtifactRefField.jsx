"use client";

import { useState, useRef, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { X, Plus } from "lucide-react";
import { ARTIFACT_TYPE_LABELS, ARTIFACT_GROUPS, ARTIFACT_GROUP_COLORS } from "@/lib/constants.js";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data);

function getGroupColor(type) {
  for (const group of ARTIFACT_GROUPS) {
    if (group.types.includes(type)) return ARTIFACT_GROUP_COLORS[group.key];
  }
  return ARTIFACT_GROUP_COLORS.foundations;
}

export default function ArtifactRefField({
  projectId,
  artifactId,
  targetTypes,
  relationType = "RELATES_TO",
  label,
  hint,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const dropRef = useRef(null);

  const relationsKey = artifactId
    ? `/api/projects/${projectId}/artifacts/${artifactId}/relations`
    : null;

  const { data: relationsData } = useSWR(relationsKey, fetcher);
  const { data: allArtifacts } = useSWR(
    `/api/projects/${projectId}/artifacts`,
    fetcher
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Collect linked artifacts of the target types (deduplicated by artifactId)
  const linkedMap = new Map();
  if (relationsData) {
    for (const r of relationsData.relationsFrom ?? []) {
      if (targetTypes.includes(r.target.type) && !linkedMap.has(r.target.id)) {
        linkedMap.set(r.target.id, { relationId: r.id, artifact: r.target });
      }
    }
    for (const r of relationsData.relationsTo ?? []) {
      if (targetTypes.includes(r.source.type) && !linkedMap.has(r.source.id)) {
        linkedMap.set(r.source.id, { relationId: r.id, artifact: r.source });
      }
    }
  }
  const linked = [...linkedMap.values()];
  const linkedIds = new Set(linkedMap.keys());

  const pickable = (Array.isArray(allArtifacts) ? allArtifacts : []).filter(
    (a) => targetTypes.includes(a.type) && !linkedIds.has(a.id) && a.id !== artifactId
  );

  async function handleAdd(target) {
    setOpen(false);
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}/artifacts/${artifactId}/relations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: relationType, targetId: target.id }),
      });
      mutate(relationsKey);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(relationId) {
    setSaving(true);
    try {
      await fetch(
        `/api/projects/${projectId}/artifacts/${artifactId}/relations/${relationId}`,
        { method: "DELETE" }
      );
      mutate(relationsKey);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {hint && <span className="text-xs text-gray-400">{hint}</span>}
        </div>
      )}

      {!artifactId ? (
        <p className="text-xs italic text-gray-400">
          Erst speichern, dann Verknüpfungen setzen.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5 min-h-[1.75rem]">
          {linked.map(({ relationId, artifact }) => {
            const colors = getGroupColor(artifact.type);
            return (
              <span
                key={artifact.id}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colors.badge}`}
              >
                {artifact.title}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(relationId)}
                    disabled={saving}
                    aria-label={`${artifact.title} entfernen`}
                    className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity disabled:cursor-wait"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </span>
            );
          })}

          {linked.length === 0 && disabled && (
            <span className="text-xs italic text-gray-400">Keine Verknüpfungen.</span>
          )}

          {!disabled && (
            <div className="relative" ref={dropRef}>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                disabled={saving}
                aria-label="Verknüpfung hinzufügen"
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-xs text-gray-400
                  hover:border-blue-400 hover:text-blue-600 transition-colors disabled:cursor-wait"
              >
                <Plus className="h-3 w-3" />
                Hinzufügen
              </button>

              {open && (
                <div className="absolute left-0 top-full z-20 mt-1 max-h-60 min-w-[240px] max-w-[300px] overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {pickable.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-gray-400">
                      Keine weiteren Artefakte verfügbar.
                    </p>
                  ) : (
                    pickable.map((a) => {
                      const colors = getGroupColor(a.type);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => handleAdd(a)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50"
                        >
                          <span
                            className={`inline-block flex-shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium ${colors.badge}`}
                          >
                            {ARTIFACT_TYPE_LABELS[a.type] ?? a.type}
                          </span>
                          <span className="truncate text-sm text-gray-700">{a.title}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
