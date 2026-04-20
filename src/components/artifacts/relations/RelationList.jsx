"use client";

import { useState } from "react";
import useSWR from "swr";
import { Link2, Plus, Trash2 } from "lucide-react";
import { mutate as globalMutate } from "swr";
import { RELATION_TYPE_LABELS, ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";
import Spinner from "@/components/ui/Spinner.jsx";
import ConfirmDialog from "@/components/ui/ConfirmDialog.jsx";
import RelationAddDialog from "./RelationAddDialog.jsx";
import { useProjectRole, hasRole } from "@/lib/ProjectRoleContext.js";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data);

const STATUS_DOT = {
  DONE: "bg-green-500",
  IN_REVIEW: "bg-yellow-400",
  DRAFT: "bg-gray-300",
};

function RelationRow({ relation, artifact, direction, projectId, artifactId, onDeleted, canEdit }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/artifacts/${artifactId}/relations/${relation.id}`,
        { method: "DELETE" }
      );
      if (res.ok) onDeleted(relation.id);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <div className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50">
        <span className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[artifact.status] ?? "bg-gray-300"}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 flex-shrink-0">
              {direction === "from" ? RELATION_TYPE_LABELS[relation.type] : `← ${RELATION_TYPE_LABELS[relation.type]}`}
            </span>
          </div>
          <p className="truncate text-sm text-gray-800">{artifact.title}</p>
          <p className="text-xs text-gray-400">{ARTIFACT_TYPE_LABELS[artifact.type] ?? artifact.type}</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className="flex-shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500"
            title="Verknüpfung entfernen"
          >
            {deleting ? <Spinner className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Verknüpfung entfernen"
        description={`Soll die Verknüpfung zu „${artifact.title}" wirklich entfernt werden?`}
        confirmLabel="Entfernen"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default function RelationList({ projectId, artifactId }) {
  const relationsKey = `/api/projects/${projectId}/artifacts/${artifactId}/relations`;
  const { data, isLoading, mutate } = useSWR(relationsKey, fetcher);
  const [addOpen, setAddOpen] = useState(false);
  const role = useProjectRole();
  const canEdit = hasRole(role, "EDITOR");

  const relationsFrom = data?.relationsFrom ?? [];
  const relationsTo = data?.relationsTo ?? [];
  const hasAny = relationsFrom.length > 0 || relationsTo.length > 0;

  function handleAdded(newRelation) {
    mutate(
      (prev) => ({
        relationsFrom: [newRelation, ...(prev?.relationsFrom ?? [])],
        relationsTo: prev?.relationsTo ?? [],
      }),
      false
    );
    setAddOpen(false);
  }

  function handleDeleted(id) {
    mutate(
      (prev) => ({
        relationsFrom: (prev?.relationsFrom ?? []).filter((r) => r.id !== id),
        relationsTo: (prev?.relationsTo ?? []).filter((r) => r.id !== id),
      }),
      false
    );
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Link2 className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Verknüpfungen</span>
          {!isLoading && (
            <span className="text-xs text-gray-400">({relationsFrom.length + relationsTo.length})</span>
          )}
        </div>
        {canEdit && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Hinzufügen
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
          <Spinner className="h-4 w-4" /> Lade Verknüpfungen…
        </div>
      ) : !hasAny ? (
        <p className="text-sm text-gray-400 italic px-1">Keine Verknüpfungen vorhanden</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {relationsFrom.map((r) => (
            <RelationRow
              key={r.id}
              relation={r}
              artifact={r.target}
              direction="from"
              projectId={projectId}
              artifactId={artifactId}
              onDeleted={handleDeleted}
              canEdit={canEdit}
            />
          ))}
          {relationsTo.map((r) => (
            <RelationRow
              key={r.id}
              relation={r}
              artifact={r.source}
              direction="to"
              projectId={projectId}
              artifactId={artifactId}
              onDeleted={handleDeleted}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      {addOpen && (
        <RelationAddDialog
          projectId={projectId}
          artifactId={artifactId}
          onAdded={handleAdded}
          onCancel={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}
