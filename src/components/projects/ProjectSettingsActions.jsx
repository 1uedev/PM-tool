"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import ConfirmDialog from "@/components/ui/ConfirmDialog.jsx";
import Spinner from "@/components/ui/Spinner.jsx";

export default function ProjectSettingsActions({ project }) {
  const router = useRouter();
  const isArchived = project.status === "ARCHIVED";

  const [archiveLoading, setArchiveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleArchive() {
    setArchiveLoading(true);
    try {
      await fetch(`/api/projects/${project.id}/archive`, { method: "PATCH" });
      router.push("/projects");
      router.refresh();
    } finally {
      setArchiveLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      router.push("/projects");
      router.refresh();
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {isArchived ? "Projekt reaktivieren" : "Projekt archivieren"}
          </p>
          <p className="text-sm text-gray-500">
            {isArchived
              ? "Das Projekt wird wieder als aktiv markiert."
              : "Das Projekt wird als archiviert markiert und aus der aktiven Liste ausgeblendet."}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleArchive}
          disabled={archiveLoading}
        >
          {archiveLoading ? (
            <Spinner className="w-4 h-4" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          {isArchived ? "Reaktivieren" : "Archivieren"}
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
        <div>
          <p className="text-sm font-medium text-red-900">Projekt löschen</p>
          <p className="text-sm text-red-700">
            Alle Artefakte und Daten werden unwiderruflich gelöscht.
          </p>
        </div>
        <Button
          variant="danger"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleteLoading}
        >
          {deleteLoading ? <Spinner className="w-4 h-4" /> : <Trash2 className="h-4 w-4" />}
          Löschen
        </Button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Projekt löschen?"
        description={`Das Projekt "${project.name}" und alle zugehörigen Artefakte werden unwiderruflich gelöscht.`}
        confirmLabel="Endgültig löschen"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
