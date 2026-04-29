"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  X,
  Sparkles,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";

const ACCEPT = ".pdf,.docx,.txt,.md";
const MIME_LABELS = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "text/plain": "TXT",
  "text/markdown": "MD",
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ProposalCard({ proposal, checked, onToggle, expanded, onExpandToggle }) {
  const label = ARTIFACT_TYPE_LABELS[proposal.type] ?? proposal.type;
  const fieldEntries = Object.entries(proposal.fields).filter(([, v]) => v);

  return (
    <div
      className={`rounded-lg border transition-colors ${
        checked ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => onToggle(proposal._id)}
          className="flex-shrink-0 text-blue-600 hover:text-blue-700"
        >
          {checked ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-gray-400" />}
        </button>

        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{proposal.title}</p>
          <span className="text-xs text-gray-500">{label}</span>
        </div>

        {fieldEntries.length > 0 && (
          <button
            type="button"
            onClick={() => onExpandToggle(proposal._id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>

      {expanded && fieldEntries.length > 0 && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2 space-y-2">
          {fieldEntries.map(([key, value]) => (
            <div key={key}>
              <p className="text-xs font-medium text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="text-xs text-gray-700 whitespace-pre-wrap line-clamp-3">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentImport({ projectId }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  const [proposals, setProposals] = useState(null); // null = not yet analyzed
  const [selected, setSelected] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set());

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // ── File handling ──────────────────────────────────────────────────────────

  function addFiles(newFiles) {
    const valid = [...newFiles].filter((f) => f.size <= 10 * 1024 * 1024);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      const unique = valid.filter((f) => !existing.has(f.name + f.size));
      return [...prev, ...unique].slice(0, 5); // max 5 files
    });
    setProposals(null);
    setAnalyzeError("");
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setProposals(null);
    setAnalyzeError("");
  }

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Analyze ────────────────────────────────────────────────────────────────

  async function handleAnalyze() {
    if (files.length === 0) return;
    setAnalyzing(true);
    setAnalyzeError("");

    try {
      const formData = new FormData();
      for (const file of files) formData.append("files", file);

      const res = await fetch(`/api/projects/${projectId}/import`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        setAnalyzeError(json.error?.message ?? "Analyse fehlgeschlagen");
        return;
      }

      const raw = json.data.proposals;
      if (raw.length === 0) {
        setAnalyzeError("Die KI konnte keine Artefakte in den Dokumenten finden. Bitte prüfe den Inhalt.");
        return;
      }

      // Assign stable IDs for selection tracking
      const tagged = raw.map((p, i) => ({ ...p, _id: i }));
      setProposals(tagged);
      setSelected(new Set(tagged.map((p) => p._id)));
    } catch {
      setAnalyzeError("Netzwerkfehler. Bitte versuche es erneut.");
    } finally {
      setAnalyzing(false);
    }
  }

  // ── Selection ──────────────────────────────────────────────────────────────

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === proposals.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(proposals.map((p) => p._id)));
    }
  }

  function toggleExpand(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Create artifacts ───────────────────────────────────────────────────────

  async function handleCreate() {
    if (!proposals || selected.size === 0) return;
    setCreating(true);
    setCreateError("");

    const toCreate = proposals
      .filter((p) => selected.has(p._id))
      .map(({ type, title, fields }) => ({ type, title, fields }));

    try {
      const res = await fetch(`/api/projects/${projectId}/artifacts/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artifacts: toCreate }),
      });
      const json = await res.json();

      if (!res.ok) {
        setCreateError(json.error?.message ?? "Erstellen fehlgeschlagen");
        return;
      }

      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch {
      setCreateError("Netzwerkfehler. Bitte versuche es erneut.");
    } finally {
      setCreating(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">

      {/* Step 1: Upload */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          1. Dokumente hochladen
        </h2>

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer
            ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Dateien hier ablegen oder klicken zum Auswählen
            </p>
            <p className="mt-1 text-xs text-gray-500">PDF, DOCX, TXT, MD — max. 10 MB pro Datei, bis zu 5 Dateien</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />

        {/* File list */}
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((file, i) => (
              <li key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="flex-1 truncate text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-400">{MIME_LABELS[file.type] ?? "Datei"} · {formatBytes(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Analyze button */}
      {files.length > 0 && !proposals && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            variant="primary"
            className="w-full justify-center"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                KI analysiert…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Mit KI analysieren
              </>
            )}
          </Button>
          {analyzeError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              {analyzeError}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Review proposals */}
      {proposals && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              2. Artefakte auswählen
            </h2>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-blue-600 hover:underline"
            >
              {selected.size === proposals.length ? "Alle abwählen" : "Alle auswählen"}
            </button>
          </div>

          <p className="mb-3 text-xs text-gray-500">
            Die KI hat {proposals.length} Artefakt{proposals.length !== 1 ? "e" : ""} gefunden.
            Wähle die aus, die du erstellen möchtest.
          </p>

          <div className="space-y-2">
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal._id}
                proposal={proposal}
                checked={selected.has(proposal._id)}
                onToggle={toggleOne}
                expanded={expanded.has(proposal._id)}
                onExpandToggle={toggleExpand}
              />
            ))}
          </div>

          {/* Re-analyze */}
          <button
            type="button"
            onClick={() => { setProposals(null); setAnalyzeError(""); }}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700 hover:underline"
          >
            Neu analysieren
          </button>
        </section>
      )}

      {/* Step 3: Create */}
      {proposals && selected.size > 0 && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleCreate}
            disabled={creating}
            variant="primary"
            className="w-full justify-center"
          >
            {creating ? (
              <>
                <Spinner className="h-4 w-4" />
                Artefakte werden erstellt…
              </>
            ) : (
              `${selected.size} Artefakt${selected.size !== 1 ? "e" : ""} erstellen`
            )}
          </Button>
          {createError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              {createError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
