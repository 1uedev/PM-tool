"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  X,
  Sparkles,
  CheckSquare,
  Square,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Link2,
  Quote,
} from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import {
  ARTIFACT_TYPE_LABELS,
  ARTIFACT_GROUPS,
  RELATION_TYPE_LABELS,
} from "@/lib/constants.js";

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

function confidencePercent(c) {
  if (typeof c !== "number" || Number.isNaN(c)) return null;
  return `${Math.round(c * 100)}%`;
}

function confidenceClass(c) {
  if (typeof c !== "number") return "bg-gray-100 text-gray-700";
  if (c >= 0.75) return "bg-green-100 text-green-700";
  if (c >= 0.5) return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-700";
}

// ─── Proposal card ─────────────────────────────────────────────────────────

function ProposalCard({ proposal, checked, onToggle, expanded, onExpandToggle }) {
  const label = ARTIFACT_TYPE_LABELS[proposal.type] ?? proposal.type;
  const fieldEntries = Object.entries(proposal.fields ?? {}).filter(([, v]) => v);
  const checkId = `proposal-${proposal._id}`;
  const conf = confidencePercent(proposal.confidence);
  const hasDetails =
    fieldEntries.length > 0 ||
    (Array.isArray(proposal.evidence) && proposal.evidence.length > 0) ||
    proposal.rationale;

  return (
    <div
      data-testid="proposal-card"
      className={`rounded-lg border transition-colors ${
        checked ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <label htmlFor={checkId} className="flex-shrink-0 cursor-pointer text-blue-600 hover:text-blue-700">
          <input
            id={checkId}
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(proposal._id)}
            className="sr-only"
          />
          {checked ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-gray-400" />}
        </label>

        <label htmlFor={checkId} className="flex flex-1 flex-col gap-0.5 min-w-0 cursor-pointer">
          <p className="truncate text-sm font-medium text-gray-900">{proposal.title}</p>
          <span className="text-xs text-gray-500">
            {label}
            {proposal.inferred ? " · inferiert" : ""}
          </span>
        </label>

        {conf && (
          <span
            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${confidenceClass(proposal.confidence)}`}
            title="Confidence"
          >
            {conf}
          </span>
        )}

        {hasDetails && (
          <button
            type="button"
            aria-label={expanded ? "Details zuklappen" : "Details aufklappen"}
            onClick={() => onExpandToggle(proposal._id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>

      {expanded && hasDetails && (
        <div className="space-y-3 border-t border-gray-100 px-3 pb-3 pt-2">
          {proposal.rationale && (
            <p className="text-xs italic text-gray-600">{proposal.rationale}</p>
          )}
          {fieldEntries.length > 0 && (
            <div className="space-y-2">
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
          {Array.isArray(proposal.evidence) && proposal.evidence.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">Belege aus dem Dokument</p>
              {proposal.evidence.map((e, i) => (
                <div
                  key={i}
                  className="flex gap-2 rounded border border-gray-200 bg-gray-50 px-2 py-1.5"
                >
                  <Quote className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-xs italic text-gray-700 line-clamp-3">“{e.quote}”</p>
                    {e.fileName && (
                      <p className="text-[10px] text-gray-400">{e.fileName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Coverage panel ────────────────────────────────────────────────────────

function CoveragePanel({ proposals, stats }) {
  const coveredTypes = useMemo(() => {
    const s = new Set();
    for (const p of proposals) s.add(p.type);
    return s;
  }, [proposals]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-700">Abdeckung</h3>
        <span className="text-xs text-gray-500">
          {coveredTypes.size} von {stats?.extractableTypeCount ?? "?"} Sektionen abgedeckt
        </span>
      </div>
      <div className="space-y-2">
        {ARTIFACT_GROUPS.map((group) => {
          const groupTypes = group.types.filter(
            (t) => ARTIFACT_TYPE_LABELS[t] !== undefined
          );
          const covered = groupTypes.filter((t) => coveredTypes.has(t));
          return (
            <div key={group.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">{group.label}</span>
                <span className="text-gray-500">
                  {covered.length}/{groupTypes.length}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {groupTypes.map((t) => {
                  const isCovered = coveredTypes.has(t);
                  return (
                    <span
                      key={t}
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        isCovered
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-gray-50 text-gray-400"
                      }`}
                      title={ARTIFACT_TYPE_LABELS[t] ?? t}
                    >
                      {ARTIFACT_TYPE_LABELS[t] ?? t}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function DocumentImport({ projectId }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [fileWarning, setFileWarning] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  const [proposals, setProposals] = useState(null); // null = not yet analyzed
  const [relations, setRelations] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [selectedRelations, setSelectedRelations] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set());

  const [autoCreate, setAutoCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // ── File handling ──────────────────────────────────────────────────────────

  function addFiles(newFiles) {
    const all = [...newFiles];
    const oversized = all.filter((f) => f.size > 10 * 1024 * 1024);
    const valid = all.filter((f) => f.size <= 10 * 1024 * 1024);

    const warnings = [];
    if (oversized.length === 1) {
      warnings.push(`„${oversized[0].name}" überschreitet 10 MB und wurde nicht hinzugefügt.`);
    } else if (oversized.length > 1) {
      warnings.push(`${oversized.length} Dateien überschreiten 10 MB und wurden nicht hinzugefügt.`);
    }
    if (valid.length > 0 && files.length + valid.length > 5) {
      warnings.push("Maximal 5 Dateien erlaubt — überzählige Dateien wurden ignoriert.");
    }

    setFileWarning(warnings.join(" "));
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      const unique = valid.filter((f) => !existing.has(f.name + f.size));
      return [...prev, ...unique].slice(0, 5);
    });
    setProposals(null);
    setRelations([]);
    setStats(null);
    setAnalyzeError("");
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setProposals(null);
    setRelations([]);
    setStats(null);
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

  // ── Create (used by both manual & auto modes) ─────────────────────────────

  async function createFromTagged(tagged, taggedRelations) {
    setCreating(true);
    setCreateError("");

    const toCreateArtifacts = tagged.map((p) => ({
      clientId: p.clientId,
      type: p.type,
      title: p.title,
      fields: p.fields,
    }));
    const toCreateRelations = taggedRelations.map((r) => ({
      sourceClientId: r.sourceClientId,
      targetClientId: r.targetClientId,
      type: r.type,
    }));

    try {
      const res = await fetch(`/api/projects/${projectId}/artifacts/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artifacts: toCreateArtifacts, relations: toCreateRelations }),
      });
      const json = await res.json();

      if (!res.ok) {
        setCreateError(json.error?.message ?? "Erstellen fehlgeschlagen");
        return false;
      }
      router.push(`/projects/${projectId}`);
      router.refresh();
      return true;
    } catch {
      setCreateError("Netzwerkfehler. Bitte versuche es erneut.");
      return false;
    } finally {
      setCreating(false);
    }
  }

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

      const raw = json.data.proposals ?? [];
      const rawRelations = json.data.relations ?? [];
      const importStats = json.data.stats ?? null;

      if (raw.length === 0) {
        setAnalyzeError("Die KI konnte keine Artefakte in den Dokumenten finden. Bitte prüfe den Inhalt.");
        setStats(importStats);
        return;
      }

      // Assign stable IDs for selection tracking — keep clientId for backend.
      const tagged = raw.map((p, i) => ({ ...p, _id: i }));
      setProposals(tagged);
      setSelected(new Set(tagged.map((p) => p._id)));

      const taggedRelations = rawRelations.map((r, i) => ({ ...r, _id: i }));
      setRelations(taggedRelations);
      setSelectedRelations(new Set(taggedRelations.map((r) => r._id)));

      setStats(importStats);

      // Auto-create mode (only after explicit user opt-in before analysis).
      if (autoCreate) {
        await createFromTagged(tagged, taggedRelations);
      }
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

  function toggleRelation(id) {
    setSelectedRelations((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleExpand(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Create artifacts (manual flow) ─────────────────────────────────────────

  async function handleCreate() {
    if (!proposals || selected.size === 0) return;
    const tagged = proposals.filter((p) => selected.has(p._id));
    const selectedIds = new Set(tagged.map((p) => p.clientId));
    const taggedRelations = relations.filter(
      (r) =>
        selectedRelations.has(r._id) &&
        selectedIds.has(r.sourceClientId) &&
        selectedIds.has(r.targetClientId)
    );
    await createFromTagged(tagged, taggedRelations);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">

      {/* Step 1: Upload */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          1. Dokumente hochladen
        </h2>

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Dateien hochladen — klicken oder per Drag & Drop ablegen"
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

        {/* File rejection warning */}
        {fileWarning && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {fileWarning}
          </div>
        )}

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
                  aria-label={`${file.name} entfernen`}
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

      {/* Auto-create opt-in */}
      {files.length > 0 && !proposals && (
        <label className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={autoCreate}
            onChange={(e) => setAutoCreate(e.target.checked)}
            className="mt-0.5"
            aria-describedby="auto-create-help"
          />
          <span className="flex-1">
            <span className="font-medium text-gray-900">Automatisch erstellen nach Analyse</span>
            <span id="auto-create-help" className="block text-xs text-gray-500">
              Vorgeschlagene Artefakte und Relationen werden direkt im Projekt angelegt — ohne Vorschau und Auswahl. Du
              kannst sie anschließend im Explorer bearbeiten oder löschen.
            </span>
          </span>
        </label>
      )}

      {/* Analyze button */}
      {files.length > 0 && !proposals && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || creating}
            variant="primary"
            className="w-full justify-center"
          >
            {analyzing ? (
              <>
                <Spinner className="h-4 w-4" />
                KI analysiert…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {autoCreate ? "Analysieren und automatisch erstellen" : "Mit KI analysieren"}
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

      {/* Stats / warnings banner */}
      {stats && Array.isArray(stats.warnings) && stats.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <p className="mb-1 font-medium">Hinweise zur Analyse</p>
          <ul className="ml-4 list-disc space-y-1 text-xs">
            {stats.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 2: Review proposals */}
      {proposals && (
        <>
          <CoveragePanel proposals={proposals} stats={stats} />

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
              Die KI hat {proposals.length} Artefakt{proposals.length !== 1 ? "e" : ""} vorgeschlagen.
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
          </section>

          {/* Relations */}
          {relations.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                3. Vorgeschlagene Relationen
              </h2>
              <div className="space-y-2">
                {relations.map((rel) => {
                  const src = proposals.find((p) => p.clientId === rel.sourceClientId);
                  const tgt = proposals.find((p) => p.clientId === rel.targetClientId);
                  if (!src || !tgt) return null;
                  const checked = selectedRelations.has(rel._id);
                  const checkId = `rel-${rel._id}`;
                  return (
                    <label
                      key={rel._id}
                      htmlFor={checkId}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-sm cursor-pointer ${
                        checked ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"
                      }`}
                    >
                      <input
                        id={checkId}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRelation(rel._id)}
                        className="sr-only"
                      />
                      <span className="flex-shrink-0 text-blue-600">
                        {checked ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-gray-400" />}
                      </span>
                      <span className="flex flex-1 flex-col gap-1 min-w-0">
                        <span className="flex items-center gap-2 text-xs">
                          <Link2 className="h-3 w-3 text-gray-400" />
                          <span className="truncate font-medium text-gray-800">{src.title}</span>
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase text-gray-600">
                            {RELATION_TYPE_LABELS[rel.type] ?? rel.type}
                          </span>
                          <span className="truncate font-medium text-gray-800">{tgt.title}</span>
                        </span>
                        {rel.rationale && (
                          <span className="text-xs italic text-gray-500">{rel.rationale}</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {/* Re-analyze */}
          <button
            type="button"
            onClick={() => {
              setProposals(null);
              setRelations([]);
              setStats(null);
              setAnalyzeError("");
            }}
            className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
          >
            Neu analysieren
          </button>
        </>
      )}

      {/* Step 4: Create */}
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
              `${selected.size} Artefakt${selected.size !== 1 ? "e" : ""} erstellen${
                selectedRelations.size > 0 ? ` + ${selectedRelations.size} Relation${selectedRelations.size !== 1 ? "en" : ""}` : ""
              }`
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
