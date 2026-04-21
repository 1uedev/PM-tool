"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText } from "lucide-react";
import { ARTIFACT_TYPE_LABELS, ARTIFACT_STATUS_LABELS, ARTIFACT_TYPE, ARTIFACT_STATUS } from "@/lib/constants.js";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const STATUS_DOT = {
  DRAFT: "bg-gray-300",
  IN_REVIEW: "bg-yellow-400",
  DONE: "bg-green-500",
};

export default function SearchDialog({ projectId, open, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const debouncedQuery = useDebounce(query, 250);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setTypeFilter("");
      setStatusFilter("");
      setResults([]);
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const fetchResults = useCallback(async () => {
    if (!debouncedQuery && !typeFilter && !statusFilter) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/projects/${projectId}/search?${params}`);
      if (res.ok) {
        const json = await res.json();
        setResults(json.data ?? []);
        setActiveIdx(0);
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, typeFilter, statusFilter, projectId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  function navigate(id) {
    router.push(`/projects/${projectId}?artifact=${id}`);
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[activeIdx]) { navigate(results[activeIdx].id); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-xl border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Artefakte suchen…"
            className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
          {(query || typeFilter || statusFilter) && (
            <button onClick={() => { setQuery(""); setTypeFilter(""); setStatusFilter(""); }} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">Esc</button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-gray-100 px-4 py-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 focus:outline-none"
          >
            <option value="">Alle Typen</option>
            {Object.entries(ARTIFACT_TYPE).map(([key]) => (
              <option key={key} value={key}>{ARTIFACT_TYPE_LABELS[key]}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 focus:outline-none"
          >
            <option value="">Alle Status</option>
            {Object.entries(ARTIFACT_STATUS).map(([key]) => (
              <option key={key} value={key}>{ARTIFACT_STATUS_LABELS[key]}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-1">
          {loading && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">Suche…</p>
          )}
          {!loading && results.length === 0 && (query || typeFilter || statusFilter) && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">Keine Ergebnisse</p>
          )}
          {!loading && results.length === 0 && !query && !typeFilter && !statusFilter && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">Suchbegriff eingeben…</p>
          )}
          {results.map((r, idx) => (
            <button
              key={r.id}
              onClick={() => navigate(r.id)}
              className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors
                ${idx === activeIdx ? "bg-blue-50" : "hover:bg-gray-50"}`}
            >
              <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[r.status] ?? "bg-gray-300"}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{r.title}</p>
                <p className="text-xs text-gray-400">{ARTIFACT_TYPE_LABELS[r.type] ?? r.type}</p>
                {r.snippet && (
                  <p className="mt-0.5 truncate text-xs text-gray-500">{r.snippet}</p>
                )}
              </div>
              <FileText className="h-4 w-4 flex-shrink-0 text-gray-300 mt-0.5" />
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
          <span><kbd className="rounded bg-gray-100 px-1">↑↓</kbd> navigieren</span>
          <span><kbd className="rounded bg-gray-100 px-1">↵</kbd> öffnen</span>
          <span><kbd className="rounded bg-gray-100 px-1">Esc</kbd> schließen</span>
        </div>
      </div>
    </div>
  );
}
