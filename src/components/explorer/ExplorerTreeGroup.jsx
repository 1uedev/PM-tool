"use client";

import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ExplorerTreeItem from "./ExplorerTreeItem.jsx";
import { ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";

export default function ExplorerTreeGroup({ type, artifacts, projectId }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleNew(e) {
    e.stopPropagation();
    const params = new URLSearchParams(searchParams);
    params.set("new", type);
    params.delete("artifact");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-100"
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
        <button
          onClick={handleNew}
          title={`Neue ${ARTIFACT_TYPE_LABELS[type]} anlegen`}
          className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-200"
        >
          <Plus className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </button>

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
  );
}
