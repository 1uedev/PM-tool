"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  RELATION_TYPE_LABELS,
  ARTIFACT_TYPE_LABELS,
  ARTIFACT_GROUPS,
  RELATION_SUGGESTIONS,
} from "@/lib/constants.js";
import Button from "@/components/ui/Button.jsx";
import Spinner from "@/components/ui/Spinner.jsx";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data);

const RELATION_OPTIONS = Object.entries(RELATION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function RelationAddDialog({
  projectId,
  artifactId,
  sourceType,
  onAdded,
  onCancel,
}) {
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedType, setSelectedType] = useState("RELATES_TO");
  const [suggestedType, setSuggestedType] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { data: artifacts, isLoading } = useSWR(
    `/api/projects/${projectId}/artifacts`,
    fetcher
  );

  // Exclude the current artifact from the list
  const candidates = (artifacts ?? []).filter((a) => a.id !== artifactId);

  // When target changes, auto-suggest relation type based on source+target types
  useEffect(() => {
    if (!selectedTarget || !sourceType) return;
    const target = candidates.find((a) => a.id === selectedTarget);
    if (!target) return;
    const suggestion = RELATION_SUGGESTIONS[sourceType]?.[target.type];
    if (suggestion) {
      setSelectedType(suggestion);
      setSuggestedType(suggestion);
    } else {
      setSuggestedType(null);
    }
  }, [selectedTarget, sourceType, candidates]);

  // Group candidates by artifact group for better UX with many types
  const groupedCandidates = ARTIFACT_GROUPS.map((group) => ({
    ...group,
    items: candidates.filter((a) => group.types.includes(a.type)),
  })).filter((g) => g.items.length > 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedTarget) {
      setError("Bitte ein Ziel-Artefakt auswählen.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(
        `/api/projects/${projectId}/artifacts/${artifactId}/relations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetId: selectedTarget, type: selectedType }),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message ?? "Fehler beim Anlegen der Verknüpfung");
        return;
      }

      onAdded(json.data);
    } catch {
      setError("Netzwerkfehler — bitte versuche es erneut");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Verknüpfung anlegen</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Target artifact — shown first so type can be auto-suggested */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Ziel-Artefakt</label>
            {isLoading ? (
              <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
                <Spinner className="h-4 w-4" /> Lade Artefakte…
              </div>
            ) : candidates.length === 0 ? (
              <p className="py-2 text-sm text-gray-400 italic">Keine anderen Artefakte vorhanden</p>
            ) : (
              <select
                value={selectedTarget}
                onChange={(e) => { setSelectedTarget(e.target.value); setError(""); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">— Artefakt auswählen —</option>
                {groupedCandidates.map((group) => (
                  <optgroup key={group.key} label={group.label}>
                    {group.items.map((a) => (
                      <option key={a.id} value={a.id}>
                        [{ARTIFACT_TYPE_LABELS[a.type] ?? a.type}] {a.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          {/* Relation type — auto-suggested based on source+target */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Beziehungstyp
              {suggestedType && (
                <span className="ml-2 text-xs font-normal text-blue-600">
                  (empfohlen)
                </span>
              )}
            </label>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setSuggestedType(null); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {RELATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving || candidates.length === 0}>
              {saving ? <><Spinner className="h-4 w-4" /> Anlegen…</> : "Verknüpfen"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
