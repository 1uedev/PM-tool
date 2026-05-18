"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";
import Spinner from "@/components/ui/Spinner.jsx";

const ACTION_META = {
  ARTIFACT_DELETE:    { label: "Artefakt gelöscht",        badge: "bg-red-100 text-red-700" },
  ARTIFACT_RESTORE:   { label: "Version wiederhergestellt", badge: "bg-blue-100 text-blue-700" },
  PROJECT_ARCHIVE:    { label: "Projekt archiviert",        badge: "bg-orange-100 text-orange-700" },
  PROJECT_UNARCHIVE:  { label: "Projekt reaktiviert",       badge: "bg-green-100 text-green-700" },
};

const ALL_ACTIONS = Object.keys(ACTION_META);
const LIMIT = 50;

function parseMeta(raw) {
  try { return typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return {}; }
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function ActionBadge({ action }) {
  const m = ACTION_META[action] ?? { label: action, badge: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${m.badge}`}>
      {m.label}
    </span>
  );
}

function MetaCell({ action, meta }) {
  const m = parseMeta(meta);
  if (action === "ARTIFACT_DELETE" || action === "ARTIFACT_RESTORE") {
    const typeLabel = ARTIFACT_TYPE_LABELS[m.artifactType] ?? m.artifactType ?? "—";
    const restored = m.restoredFromVersion != null ? ` (v${m.restoredFromVersion})` : "";
    return (
      <span className="text-gray-700">
        <span className="font-medium">{m.artifactTitle ?? "—"}</span>
        <span className="ml-1 text-gray-400 text-xs">{typeLabel}{restored}</span>
      </span>
    );
  }
  if (action === "PROJECT_ARCHIVE" || action === "PROJECT_UNARCHIVE") {
    return <span className="font-medium text-gray-700">{m.projectName ?? "—"}</span>;
  }
  return <span className="text-gray-400 text-xs">—</span>;
}

export default function AuditLogTable() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPage = useCallback(async (p, action) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: p, limit: LIMIT });
      if (action) params.set("action", action);
      const res = await fetch(`/api/admin/audit?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Fehler beim Laden");
      setEntries(json.data.entries);
      setTotal(json.data.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(page, actionFilter);
  }, [page, actionFilter, fetchPage]);

  function handleFilterChange(action) {
    setActionFilter(action);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Aktion:</span>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Nach Aktion filtern">
          <button
            onClick={() => handleFilterChange("")}
            aria-pressed={actionFilter === ""}
            className={`rounded-full px-3 py-1 text-xs transition-colors
              ${actionFilter === "" ? "bg-blue-100 font-medium text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
          >
            Alle
          </button>
          {ALL_ACTIONS.map((a) => (
            <button
              key={a}
              onClick={() => handleFilterChange(a)}
              aria-pressed={actionFilter === a}
              className={`rounded-full px-3 py-1 text-xs transition-colors
                ${actionFilter === a ? "bg-blue-100 font-medium text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              {ACTION_META[a].label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Zeitpunkt</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Aktion</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Benutzer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Betrifft</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  <Spinner className="mx-auto h-5 w-5 text-blue-500" />
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                  Keine Einträge gefunden.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ActionBadge action={entry.action} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {entry.user?.name || entry.user?.email || entry.userId}
                  </td>
                  <td className="px-4 py-3">
                    <MetaCell action={entry.action} meta={entry.meta} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{total} {total === 1 ? "Eintrag" : "Einträge"} gesamt</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            aria-label="Vorherige Seite"
            className="rounded-lg p-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>Seite {page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            aria-label="Nächste Seite"
            className="rounded-lg p-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
