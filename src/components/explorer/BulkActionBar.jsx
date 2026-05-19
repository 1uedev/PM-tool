"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { Trash2, Tag, CheckSquare, X, ChevronDown } from "lucide-react";
import { useBulkSelect } from "@/lib/BulkSelectContext.js";
import { ARTIFACT_STATUS_LABELS } from "@/lib/constants.js";
import ConfirmDialog from "@/components/ui/ConfirmDialog.jsx";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: ARTIFACT_STATUS_LABELS.DRAFT },
  { value: "IN_REVIEW", label: ARTIFACT_STATUS_LABELS.IN_REVIEW },
  { value: "DONE", label: ARTIFACT_STATUS_LABELS.DONE },
];

export default function BulkActionBar({ projectId, tags }) {
  const { selectedIds, clear } = useBulkSelect();
  const { mutate } = useSWRConfig();

  const [statusOpen, setStatusOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const count = selectedIds.size;

  async function applyStatus(status) {
    if (count === 0) return;
    setStatusOpen(false);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/artifacts/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds], status }),
      });
      if (!res.ok) throw new Error("Fehler beim Statuswechsel");
      mutate(`/api/projects/${projectId}/artifacts`);
      clear();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function assignTags(tagId) {
    if (count === 0) return;
    setTagOpen(false);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/artifacts/bulk/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds], tagIds: [tagId] }),
      });
      if (!res.ok) throw new Error("Fehler beim Tag-Zuweisen");
      mutate(`/api/projects/${projectId}/artifacts`);
      clear();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setConfirmDelete(false);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/artifacts/bulk`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds] }),
      });
      if (!res.ok) throw new Error("Fehler beim Löschen");
      mutate(`/api/projects/${projectId}/artifacts`);
      clear();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (count === 0 && !busy) return null;

  return (
    <>
      <div className="flex flex-col gap-1 border-t border-blue-200 bg-blue-50 px-3 py-2">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-medium text-blue-700 mr-1">
            {count} ausgewählt
          </span>

          {/* Status dropdown */}
          <div className="relative">
            <button
              disabled={busy || count === 0}
              onClick={() => { setStatusOpen((v) => !v); setTagOpen(false); }}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              <CheckSquare className="h-3 w-3" aria-hidden="true" />
              Status
              <ChevronDown className="h-3 w-3" aria-hidden="true" />
            </button>
            {statusOpen && (
              <div className="absolute bottom-full left-0 mb-1 z-20 w-36 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => applyStatus(opt.value)}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tag dropdown */}
          {tags && tags.length > 0 && (
            <div className="relative">
              <button
                disabled={busy || count === 0}
                onClick={() => { setTagOpen((v) => !v); setStatusOpen(false); }}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <Tag className="h-3 w-3" aria-hidden="true" />
                Tag
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
              </button>
              {tagOpen && (
                <div className="absolute bottom-full left-0 mb-1 z-20 w-44 rounded-lg border border-gray-200 bg-white shadow-lg py-1 max-h-48 overflow-y-auto">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => assignTags(tag.id)}
                      className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 truncate"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delete */}
          <button
            disabled={busy || count === 0}
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 ml-auto"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            Löschen
          </button>

          {/* Cancel */}
          <button
            onClick={clear}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
            aria-label="Auswahl beenden"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Artefakte löschen"
        description={`${count} Artefakt${count !== 1 ? "e" : ""} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmLabel="Löschen"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
