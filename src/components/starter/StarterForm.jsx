"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ExternalLink, Rocket } from "lucide-react";
import {
  STARTER_QUESTIONS,
  STARTER_ARTIFACT_LINKS,
} from "@/lib/starterContext.js";
import { ARTIFACT_TYPE_LABELS, ARTIFACT_GROUP_COLORS, ARTIFACT_GROUPS } from "@/lib/constants.js";

const STATUS_DOT = { DONE: "text-green-500", IN_REVIEW: "text-yellow-500", DRAFT: "text-gray-400" };
const STATUS_LABEL = { DONE: "Done", IN_REVIEW: "In Review", DRAFT: "Draft" };

function getGroupKey(type) {
  return ARTIFACT_GROUPS.find((g) => g.types.includes(type))?.key;
}

function ArtifactChip({ artifact, projectId }) {
  const groupKey = getGroupKey(artifact.type);
  const colors = groupKey ? ARTIFACT_GROUP_COLORS[groupKey] : null;
  return (
    <Link
      href={`/projects/${projectId}?artifact=${artifact.id}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium hover:opacity-80 transition-opacity
        ${colors ? `${colors.badge}` : "bg-gray-50 border-gray-200 text-gray-600"}`}
    >
      <span className={STATUS_DOT[artifact.status]}>●</span>
      {artifact.title}
      <ExternalLink className="h-3 w-3 opacity-50" />
    </Link>
  );
}

function TypeChip({ type, projectId, artifacts }) {
  const typeArtifacts = artifacts.filter((a) => a.type === type);
  const groupKey = getGroupKey(type);
  const colors = groupKey ? ARTIFACT_GROUP_COLORS[groupKey] : null;

  if (typeArtifacts.length === 0) {
    return (
      <Link
        href={`/projects/${projectId}?new=${type}`}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2.5 py-0.5 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
      >
        + {ARTIFACT_TYPE_LABELS[type] ?? type}
      </Link>
    );
  }

  return (
    <>
      {typeArtifacts.map((a) => (
        <ArtifactChip key={a.id} artifact={a} projectId={projectId} />
      ))}
    </>
  );
}

export default function StarterForm({ projectId, initialStarter, artifacts, canEdit }) {
  const [values, setValues] = useState(initialStarter);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const answeredCount = STARTER_QUESTIONS.filter((q) => values[q.key]?.trim()).length;
  const completionPct = Math.round((answeredCount / STARTER_QUESTIONS.length) * 100);

  const handleChange = useCallback((key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/starter`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Could not save — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-500" />
            <h1 className="text-base font-semibold text-gray-900">PRD Starter</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Answer these 10 questions to establish the foundation of your PRD.
            Your answers are shown as context when editing related artifacts.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save"}
          </button>
        )}
      </div>

      {/* Completion bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Completion</span>
          <span className={`text-sm font-semibold ${completionPct === 100 ? "text-green-600" : "text-blue-600"}`}>
            {answeredCount} / {STARTER_QUESTIONS.length} questions answered
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${completionPct === 100 ? "bg-green-500" : "bg-blue-500"}`}
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Questions */}
      <div className="flex flex-col gap-4">
        {STARTER_QUESTIONS.map((q) => {
          const answered = !!values[q.key]?.trim();
          const linkedTypes = STARTER_ARTIFACT_LINKS[q.key] ?? [];

          return (
            <div key={q.key} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start gap-3">
                {answered
                  ? <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  : <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-300" />
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-400">Q{q.number}</span>
                    <span className="text-sm font-semibold text-gray-900">{q.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{q.hint}</p>

                  <textarea
                    value={values[q.key] ?? ""}
                    onChange={(e) => handleChange(q.key, e.target.value)}
                    placeholder={q.placeholder}
                    rows={3}
                    disabled={!canEdit}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-y
                      disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />

                  {/* Linked artifact types */}
                  {linkedTypes.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-gray-400">Elaborated in:</span>
                      {linkedTypes.map((type) => (
                        <TypeChip
                          key={type}
                          type={type}
                          projectId={projectId}
                          artifacts={artifacts}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
