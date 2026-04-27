"use client";

import { useState } from "react";
import { Trash2, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { mutate } from "swr";
import { ARTIFACT_TYPE_LABELS, ARTIFACT_STATUS, ARTIFACT_STATUS_LABELS } from "@/lib/constants.js";
import ArtifactStatusBadge from "./ArtifactStatusBadge.jsx";
import ConfirmDialog from "@/components/ui/ConfirmDialog.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useProjectRole, hasRole } from "@/lib/ProjectRoleContext.js";
import TagEditor from "./tags/TagEditor.jsx";

// Status transition order
const STATUS_FLOW = [
  ARTIFACT_STATUS.DRAFT,
  ARTIFACT_STATUS.IN_REVIEW,
  ARTIFACT_STATUS.DONE,
];

const STATUS_NEXT_LABEL = {
  DRAFT: 'Als "In Prüfung" markieren',
  IN_REVIEW: 'Als "Fertig" markieren',
  DONE: 'Zurück zu "Entwurf"',
};

export default function ArtifactHeader({ artifact, projectId, onStatusChange }) {
  const router = useRouter();
  const pathname = usePathname();
  const role = useProjectRole();
  const canEdit = hasRole(role, "EDITOR");

  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentIndex = STATUS_FLOW.indexOf(artifact.status);
  const nextStatus = STATUS_FLOW[(currentIndex + 1) % STATUS_FLOW.length];

  async function handleStatusChange() {
    setStatusLoading(true);
    setStatusError("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/artifacts/${artifact.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      const json = await res.json();
      if (res.ok) {
        mutate(`/api/projects/${projectId}/artifacts`);
        mutate(`/api/projects/${projectId}/artifacts/${artifact.id}`);
        onStatusChange?.(json.data);
      } else {
        setStatusError(json.error?.message ?? "Status konnte nicht geändert werden");
      }
    } catch {
      setStatusError("Netzwerkfehler — bitte erneut versuchen");
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/artifacts/${artifact.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate(`/api/projects/${projectId}/artifacts`);
        router.push(`/projects/${projectId}`);
        router.refresh();
      } else {
        const json = await res.json();
        setDeleteError(json.error?.message ?? "Löschen fehlgeschlagen");
        setShowDeleteConfirm(false);
      }
    } catch {
      setDeleteError("Netzwerkfehler — bitte erneut versuchen");
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
        {/* Left: type + status */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 flex-shrink-0">
            {ARTIFACT_TYPE_LABELS[artifact.type] ?? artifact.type}
          </span>
          <ArtifactStatusBadge status={artifact.status} />
        </div>

        {/* Right: actions — only for EDITOR+ */}
        {canEdit && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Quick status toggle */}
            <button
              onClick={handleStatusChange}
              disabled={statusLoading}
              title={STATUS_NEXT_LABEL[artifact.status]}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
            >
              {statusLoading ? (
                <Spinner className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              {ARTIFACT_STATUS_LABELS[nextStatus]}
            </button>

            {/* Delete */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteLoading}
              title="Artefakt löschen"
              className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {deleteLoading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error banners */}
      {statusError && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {statusError}
        </div>
      )}
      {deleteError && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {deleteError}
        </div>
      )}

      {/* Tags */}
      <div className="pt-2">
        <TagEditor artifactId={artifact.id} projectId={projectId} />
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Artefakt löschen?"
        description={`"${artifact.title}" wird als gelöscht markiert und aus dem Explorer entfernt.`}
        confirmLabel="Löschen"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
