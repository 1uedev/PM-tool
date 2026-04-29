"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  RELATION_TYPE_LABELS,
  ARTIFACT_TYPE_LABELS,
  RELATION_SUGGESTIONS,
} from "@/lib/constants.js";
import Button from "@/components/ui/Button.jsx";
import Spinner from "@/components/ui/Spinner.jsx";

const RELATION_OPTIONS = Object.entries(RELATION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function GraphRelationDialog({
  projectId,
  sourceArtifact,
  targetArtifact,
  onCreated,
  onCancel,
}) {
  const suggested =
    RELATION_SUGGESTIONS[sourceArtifact.type]?.[targetArtifact.type] ?? "RELATES_TO";

  const [relationType, setRelationType] = useState(suggested);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/artifacts/${sourceArtifact.id}/relations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetId: targetArtifact.id, type: relationType }),
        }
      );
      const json = await res.json();
      if (res.ok) {
        onCreated({
          id: json.data.id,
          type: relationType,
          sourceId: sourceArtifact.id,
          targetId: targetArtifact.id,
        });
      } else {
        setError(json.error?.message ?? "Could not create relation");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Create relation</h2>
        <p className="mb-4 text-xs text-gray-400">
          Choose the relation type between these two artifacts.
        </p>

        {/* Source → Target preview */}
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              {ARTIFACT_TYPE_LABELS[sourceArtifact.type] ?? sourceArtifact.type}
            </p>
            <p className="text-sm font-medium text-gray-900 truncate">{sourceArtifact.title}</p>
          </div>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
          <div className="flex-1 min-w-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              {ARTIFACT_TYPE_LABELS[targetArtifact.type] ?? targetArtifact.type}
            </p>
            <p className="text-sm font-medium text-gray-900 truncate">{targetArtifact.title}</p>
          </div>
        </div>

        {/* Relation type selector */}
        <div className="mb-5 flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Relation type
            {relationType === suggested && (
              <span className="ml-2 text-xs font-normal text-blue-600">(recommended)</span>
            )}
          </label>
          <select
            value={relationType}
            onChange={(e) => setRelationType(e.target.value)}
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
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={saving}>
            {saving ? <><Spinner className="h-4 w-4" /> Creating…</> : "Create relation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
