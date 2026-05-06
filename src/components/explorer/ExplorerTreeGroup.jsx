"use client";

import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDirtyForm } from "@/lib/DirtyFormContext.js";
import { useProjectRole, hasRole } from "@/lib/ProjectRoleContext.js";
import ExplorerTreeItem from "./ExplorerTreeItem.jsx";
import ConfirmDialog from "@/components/ui/ConfirmDialog.jsx";
import { ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";

export default function ExplorerTreeGroup({ type, artifacts, projectId }) {
  // Start collapsed when no artifacts exist — keeps the tree clean with 26+ types
  const [open, setOpen] = useState(artifacts.length > 0);
  const [pendingNewNav, setPendingNewNav] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isDirty, setDirty } = useDirtyForm();
  const role = useProjectRole();
  const canEdit = hasRole(role, "EDITOR");

  function navigateToNew() {
    const params = new URLSearchParams(searchParams);
    params.set("new", type);
    params.delete("artifact");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleNew(e) {
    e.stopPropagation();
    if (isDirty) {
      setPendingNewNav(true);
    } else {
      navigateToNew();
    }
  }

  function confirmNew() {
    setDirty(false);
    setPendingNewNav(false);
    navigateToNew();
  }

  return (
    <>
      <div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((o) => !o)}
          className="group flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-100"
        >
          <div className="flex items-center gap-1.5">
            <ChevronRight
              className={`h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}
            />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {ARTIFACT_TYPE_LABELS[type] ?? type}
            </span>
            <span className="text-xs text-gray-400">({artifacts.length})</span>
          </div>
          {canEdit && (
            <button
              onClick={handleNew}
              title={`Neue ${ARTIFACT_TYPE_LABELS[type]} anlegen`}
              className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-200"
            >
              <Plus className="h-3.5 w-3.5 text-gray-500" />
            </button>
          )}
        </div>

        {open && (
          <div className="ml-2 mt-0.5 flex flex-col gap-0.5">
            {artifacts.length === 0 ? (
              <p className="px-3 py-1.5 text-xs text-gray-400 italic">Keine Einträge</p>
            ) : (
              artifacts.map((a) => (
                <ExplorerTreeItem key={a.id} artifact={a} projectId={projectId} />
              ))
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingNewNav}
        title="Ungespeicherte Änderungen"
        description="Du hast ungespeicherte Änderungen. Wenn du jetzt navigierst, gehen sie verloren."
        confirmLabel="Verwerfen und wechseln"
        danger
        onConfirm={confirmNew}
        onCancel={() => setPendingNewNav(false)}
      />
    </>
  );
}
