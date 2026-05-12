"use client";

import { useState } from "react";
import useSWR from "swr";
import { mutate as globalMutate } from "swr";
import { History, RotateCcw, ChevronDown, ChevronRight } from "lucide-react";
import { ARTIFACT_STATUS_LABELS } from "@/lib/constants.js";
import { useProjectRole, hasRole } from "@/lib/ProjectRoleContext.js";
import Spinner from "@/components/ui/Spinner.jsx";
import ConfirmDialog from "@/components/ui/ConfirmDialog.jsx";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data);

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function VersionRow({ version, index, isLatest, projectId, artifactId, onRestored }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState("");
  const role = useProjectRole();
  const canEdit = hasRole(role, "EDITOR");

  const authorName = version.author?.name ?? version.author?.email ?? "Unbekannt";
  const fieldEntries = Object.entries(version.fields ?? {}).filter(([, v]) => v);

  async function handleRestore() {
    setRestoring(true);
    setRestoreError("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/artifacts/${artifactId}/versions/${version.id}`,
        { method: "POST" }
      );
      const json = await res.json();
      if (res.ok) {
        globalMutate(`/api/projects/${projectId}/artifacts/${artifactId}`);
        globalMutate(`/api/projects/${projectId}/artifacts/${artifactId}/versions`);
        globalMutate(`/api/projects/${projectId}/artifacts`);
        onRestored?.(json.data);
        setConfirmOpen(false);
      } else {
        setRestoreError(json.error?.message ?? "Wiederherstellung fehlgeschlagen");
      }
    } catch {
      setRestoreError("Netzwerkfehler — bitte erneut versuchen");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <>
      <div className={`rounded-lg border ${isLatest ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-white"}`}>
        <div className="flex items-center gap-3 px-3 py-2">
          {/* Expand toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            {open
              ? <ChevronDown className="h-3.5 w-3.5" />
              : <ChevronRight className="h-3.5 w-3.5" />
            }
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${isLatest ? "text-blue-700" : "text-gray-500"}`}>
                v{version.version}
              </span>
              {isLatest && (
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600 font-medium">
                  Aktuell
                </span>
              )}
              <span className="text-xs text-gray-400">{ARTIFACT_STATUS_LABELS[version.status]}</span>
            </div>
            <p className="truncate text-xs text-gray-500">
              {authorName} · {formatDate(version.createdAt)}
            </p>
          </div>

          {/* Restore button — only for non-latest versions, EDITOR+ */}
          {!isLatest && canEdit && (
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={restoring}
              title={`Version ${version.version} wiederherstellen`}
              className="flex-shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              {restoring ? <Spinner className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        {/* Expanded field preview */}
        {open && (
          <div className="border-t border-gray-100 px-3 py-2">
            <p className="mb-1.5 text-xs font-semibold text-gray-500 truncate">
              {version.title}
            </p>
            {fieldEntries.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {fieldEntries.map(([key, value]) => (
                  <div key={key}>
                    <span className="text-xs font-medium text-gray-400 capitalize">{key}: </span>
                    <span className="text-xs text-gray-600 line-clamp-2 whitespace-pre-wrap">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Keine Felder</p>
            )}
          </div>
        )}
      </div>

      {restoreError && (
        <div className="mt-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {restoreError}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={`Version ${version.version} wiederherstellen?`}
        description={`Der aktuelle Inhalt wird durch Version ${version.version} ersetzt. Eine neue Version wird dabei automatisch angelegt.`}
        confirmLabel="Wiederherstellen"
        onConfirm={handleRestore}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default function VersionList({ projectId, artifactId }) {
  const [expanded, setExpanded] = useState(false);
  const versionsKey = `/api/projects/${projectId}/artifacts/${artifactId}/versions`;
  const { data: versions, isLoading } = useSWR(
    expanded ? versionsKey : null,
    fetcher
  );

  const count = versions?.length ?? "…";

  return (
    <div className="mt-6 border-t border-gray-100 pt-5">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="mb-3 flex w-full items-center gap-1.5 text-left"
      >
        <History className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Versionshistorie</span>
        {expanded && !isLoading && (
          <span className="text-xs text-gray-400">({count})</span>
        )}
        {expanded
          ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-auto" />
          : <ChevronRight className="h-3.5 w-3.5 text-gray-400 ml-auto" />
        }
      </button>

      {expanded && (
        <>
          {isLoading ? (
            <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
              <Spinner className="h-4 w-4" /> Lade Versionen…
            </div>
          ) : !versions?.length ? (
            <p className="text-sm text-gray-400 italic px-1">Keine Versionen gefunden</p>
          ) : (
            <div className="flex flex-col gap-2">
              {versions.map((v, i) => (
                <VersionRow
                  key={v.id}
                  version={v}
                  index={i}
                  isLatest={i === 0}
                  projectId={projectId}
                  artifactId={artifactId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
