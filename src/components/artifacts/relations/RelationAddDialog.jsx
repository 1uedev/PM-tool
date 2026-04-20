"use client";

import { useState } from "react";
import useSWR from "swr";
import { RELATION_TYPE_LABELS, ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";
import Button from "@/components/ui/Button.jsx";
import Spinner from "@/components/ui/Spinner.jsx";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data);

const RELATION_OPTIONS = Object.entries(RELATION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function RelationAddDialog({ projectId, artifactId, onAdded, onCancel }) {
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedType, setSelectedType] = useState("RELATES_TO");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { data: artifacts, isLoading } = useSWR(
    `/api/projects/${projectId}/artifacts`,
    fetcher
  );

  // Exclude the current artifact from the list
  const candidates = (artifacts ?? []).filter((a) => a.id !== artifactId);

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
          {/* Relation type */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Beziehungstyp</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {RELATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target artifact */}
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
                {candidates.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{ARTIFACT_TYPE_LABELS[a.type] ?? a.type}] {a.title}
                  </option>
                ))}
              </select>
            )}
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
