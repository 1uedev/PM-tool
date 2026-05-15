/**
 * AI-powered document extraction.
 *
 * This module proposes PM artifacts (and optional relations between them) by
 * analyzing the plain text of one or more uploaded documents.
 *
 * Single source of truth:
 *   - Canonical artifact types come from `ARTIFACT_TYPE_ORDER` / `ARTIFACT_GROUPS`.
 *   - Field schemas come from `ARTIFACT_FIELD_DEFS` (key, label, placeholder).
 *   - Relation types come from `RELATION_TYPE`.
 *
 * We never maintain a parallel hard-coded list — adding a new artifact type to
 * `ARTIFACT_FIELD_DEFS` automatically makes it importable.
 */

import { ARTIFACT_FIELD_DEFS } from "@/lib/artifactFields.js";
import {
  ARTIFACT_TYPE_ORDER,
  ARTIFACT_TYPE_LABELS,
  ARTIFACT_GROUPS,
  RELATION_TYPE,
} from "@/lib/constants.js";

// ─── Limits ────────────────────────────────────────────────────────────────

const MAX_TITLE_LEN = 200;
const MAX_FIELD_LEN = 4000;
const MAX_QUOTE_LEN = 400;
const MAX_RATIONALE_LEN = 600;
const MAX_EVIDENCE_PER_ARTIFACT = 3;

// Chunking defaults. Anthropic and OpenAI both comfortably handle ~30k chars
// per call. We keep chunks smaller to stay well under any token budget and to
// allow the model to focus.
export const DEFAULT_CHUNK_CHARS = 12000;
export const DEFAULT_CHUNK_OVERLAP = 800;

const VALID_RELATION_TYPES = new Set(Object.values(RELATION_TYPE));

// ─── Public helpers ────────────────────────────────────────────────────────

/**
 * Returns the list of artifact types we can extract. A type is extractable iff
 * a field schema exists for it in `ARTIFACT_FIELD_DEFS`. We follow the canonical
 * order from `ARTIFACT_TYPE_ORDER` so the prompt presents types in a stable,
 * group-coherent order.
 *
 * @returns {string[]}
 */
export function getCanonicalExtractableTypes() {
  return ARTIFACT_TYPE_ORDER.filter((type) => Array.isArray(ARTIFACT_FIELD_DEFS[type]));
}

/**
 * Returns the list of canonical types that have no field schema. Used to
 * surface coverage gaps in stats / warnings instead of failing silently.
 *
 * @returns {string[]}
 */
export function getMissingSchemaTypes() {
  return ARTIFACT_TYPE_ORDER.filter((type) => !Array.isArray(ARTIFACT_FIELD_DEFS[type]));
}

/**
 * Builds a per-type schema usable by both the prompt and the parser:
 *   { TYPE: { fieldKeys: [...], fields: [{ key, label, placeholder }], label } }
 *
 * @returns {Object<string, { fieldKeys: string[], fields: Array<{key:string,label:string,placeholder?:string}>, label: string }>}
 */
export function buildTypeSchemas() {
  const out = {};
  for (const type of getCanonicalExtractableTypes()) {
    const defs = ARTIFACT_FIELD_DEFS[type];
    out[type] = {
      label: ARTIFACT_TYPE_LABELS[type] ?? type,
      fieldKeys: defs.map((f) => f.key),
      fields: defs.map((f) => ({
        key: f.key,
        label: f.label,
        placeholder: f.placeholder ?? "",
      })),
    };
  }
  return out;
}

// ─── Prompt building ───────────────────────────────────────────────────────

function describeGroups() {
  const lines = [];
  for (const group of ARTIFACT_GROUPS) {
    const usable = group.types.filter((t) => Array.isArray(ARTIFACT_FIELD_DEFS[t]));
    if (usable.length === 0) continue;
    lines.push(`### ${group.label}`);
    for (const type of usable) {
      const label = ARTIFACT_TYPE_LABELS[type] ?? type;
      const fields = ARTIFACT_FIELD_DEFS[type]
        .map((f) => `${f.key} (${f.label})`)
        .join(", ");
      lines.push(`- ${type} — ${label}. Felder: ${fields}`);
    }
  }
  return lines.join("\n");
}

function describeRelationTypes() {
  return Object.values(RELATION_TYPE)
    .map((t) => `- ${t}`)
    .join("\n");
}

/**
 * Builds the extraction prompt.
 *
 * @param {string | { documentText: string, chunkIndex?: number, totalChunks?: number }} input
 * @returns {string}
 */
export function buildExtractionPrompt(input) {
  const documentText =
    typeof input === "string" ? input : input?.documentText ?? "";
  const chunkIndex = typeof input === "object" ? input?.chunkIndex : undefined;
  const totalChunks = typeof input === "object" ? input?.totalChunks : undefined;

  const chunkNote =
    typeof chunkIndex === "number" && typeof totalChunks === "number" && totalChunks > 1
      ? `\nDIES IST CHUNK ${chunkIndex + 1} VON ${totalChunks}. Konzentriere dich nur auf Inhalte in diesem Chunk. Erfinde keine Artefakte aus anderen Chunks.\n`
      : "";

  return `Du bist ein Senior Product Manager und Requirements Analyst.

Aufgabe:
Analysiere das folgende Produktdokument und schlage strukturierte PM-Artefakte für ein PM-Copilot-Projekt vor. Schlage zusätzlich Relationen zwischen den vorgeschlagenen Artefakten vor, falls plausibel.

Regeln:
1. Verwende ausschließlich die unten aufgeführten Artefakttypen und Felder.
2. Erzeuge nur Artefakte, die durch das Dokument klar belegt sind.
3. Wenn etwas sinnvoll, aber nicht direkt belegt ist, setze "inferred": true und verwende eine geringere Confidence.
4. Erzeuge keine leeren Artefakte, nur um eine Sektion zu füllen.
5. Erzeuge mehrere Artefakte desselben Typs, wenn das Dokument mehrere echte Konzepte enthält (z. B. mehrere Features, Risiken, User Stories).
6. Keine Duplikate. Wenn zwei Vorschläge denselben Inhalt beschreiben, behalte nur einen.
7. Verwende die Sprache des Quelldokuments für Titel und Feldinhalte.
8. Titel sind kurz, prägnant und eindeutig (max. ${MAX_TITLE_LEN} Zeichen).
9. Felder werden mit kurzen Strings befüllt — keine Arrays, keine Objekte, keine verschachtelten Strukturen.
10. Wenn ein Feld nicht aus dem Dokument ableitbar ist, lasse es als leeren String "".
11. Confidence ist eine Zahl zwischen 0 und 1.
12. Evidence-Quotes sind kurze, wörtliche Zitate aus dem Dokument (max. ${MAX_QUOTE_LEN} Zeichen). Erfinde keine Zitate.
13. Relationen dürfen nur zwischen Artefakten aus deiner eigenen Vorschlagsliste angelegt werden (über deren clientId).
14. Relationstypen dürfen ausschließlich aus dieser Liste stammen:
${describeRelationTypes()}
15. Halluziniere nicht. Bei Unsicherheit lieber weniger Artefakte erzeugen.
16. Gib ausschließlich gültiges JSON zurück — kein Fließtext, kein Kommentar.
${chunkNote}
Unterstützte Artefakttypen (gruppiert):
${describeGroups()}

Antwortformat (striktes JSON-Objekt):
\`\`\`json
{
  "artifacts": [
    {
      "clientId": "a1",
      "type": "PRODUCT_VISION",
      "title": "Kurzer, eindeutiger Titel",
      "fields": {
        "oneLiner": "..."
      },
      "confidence": 0.87,
      "inferred": false,
      "evidence": [
        { "fileName": "dokument.pdf", "quote": "Wörtliches Zitat aus dem Dokument" }
      ],
      "rationale": "Warum dieses Artefakt relevant ist"
    }
  ],
  "relations": [
    {
      "sourceClientId": "a1",
      "targetClientId": "a2",
      "type": "DERIVES_FROM",
      "confidence": 0.74,
      "rationale": "Warum diese Relation plausibel ist"
    }
  ]
}
\`\`\`

Wenn keine Artefakte extrahierbar sind, gib { "artifacts": [], "relations": [] } zurück.

---

DOKUMENTINHALT:
${documentText}`;
}

// ─── Parsing ───────────────────────────────────────────────────────────────

function safeString(v) {
  return typeof v === "string" ? v : "";
}

function clampNumber(n, min, max, fallback) {
  if (typeof n !== "number" || Number.isNaN(n)) return fallback;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function truncate(s, max) {
  if (typeof s !== "string") return "";
  if (s.length <= max) return s;
  return s.slice(0, max);
}

function extractJsonBlock(text) {
  if (typeof text !== "string") return null;
  // Try a fenced code block first
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // Fall back to the first top-level JSON object or array.
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;
  // Find first { ... }
  const firstBrace = trimmed.indexOf("{");
  const firstBracket = trimmed.indexOf("[");
  if (firstBrace === -1 && firstBracket === -1) return null;
  const start =
    firstBrace === -1
      ? firstBracket
      : firstBracket === -1
        ? firstBrace
        : Math.min(firstBrace, firstBracket);
  return trimmed.slice(start);
}

function tryParseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Some models trail a fence or stray comma — try to repair common cases.
    const repaired = text.replace(/,(\s*[}\]])/g, "$1");
    try {
      return JSON.parse(repaired);
    } catch {
      return null;
    }
  }
}

function sanitizeEvidence(rawEvidence) {
  if (!Array.isArray(rawEvidence)) return [];
  const out = [];
  for (const e of rawEvidence) {
    if (!e || typeof e !== "object") continue;
    const fileName = truncate(safeString(e.fileName).trim(), 200);
    const quote = truncate(safeString(e.quote).trim(), MAX_QUOTE_LEN);
    if (!quote) continue;
    out.push({ fileName, quote });
    if (out.length >= MAX_EVIDENCE_PER_ARTIFACT) break;
  }
  return out;
}

function sanitizeArtifact(raw, schemas, warnings) {
  if (!raw || typeof raw !== "object") return null;

  const type = safeString(raw.type).trim();
  const schema = schemas[type];
  if (!schema) {
    if (type) warnings.push(`Unbekannter Artefakttyp '${type}' wurde verworfen`);
    return null;
  }

  const title = safeString(raw.title).trim();
  if (!title) return null;

  // Sanitize fields: keep only valid keys, fill missing with "", cap length.
  const fields = {};
  const rawFields =
    raw.fields && typeof raw.fields === "object" ? raw.fields : {};
  for (const key of schema.fieldKeys) {
    const value = rawFields[key];
    if (typeof value === "string") {
      fields[key] = truncate(value, MAX_FIELD_LEN);
    } else if (Array.isArray(value)) {
      // Defensive: collapse arrays into a string list.
      fields[key] = truncate(
        value.filter((v) => typeof v === "string").join("\n"),
        MAX_FIELD_LEN
      );
    } else if (value && typeof value === "object") {
      try {
        fields[key] = truncate(JSON.stringify(value), MAX_FIELD_LEN);
      } catch {
        fields[key] = "";
      }
    } else {
      fields[key] = "";
    }
  }

  const clientId = safeString(raw.clientId).trim() || null;
  const confidence = clampNumber(raw.confidence, 0, 1, 0.5);
  const inferred = raw.inferred === true;
  const evidence = sanitizeEvidence(raw.evidence);
  const rationale = truncate(safeString(raw.rationale).trim(), MAX_RATIONALE_LEN);

  return {
    clientId,
    type,
    title: truncate(title, MAX_TITLE_LEN),
    fields,
    confidence,
    inferred,
    evidence,
    rationale,
  };
}

function sanitizeRelation(raw, validClientIds, warnings) {
  if (!raw || typeof raw !== "object") return null;
  const sourceClientId = safeString(raw.sourceClientId).trim();
  const targetClientId = safeString(raw.targetClientId).trim();
  const type = safeString(raw.type).trim();

  if (!sourceClientId || !targetClientId) return null;
  if (sourceClientId === targetClientId) return null;
  if (!validClientIds.has(sourceClientId) || !validClientIds.has(targetClientId)) {
    warnings.push(
      `Relation ${sourceClientId} → ${targetClientId} verweist auf unbekannte Artefakte und wurde verworfen`
    );
    return null;
  }
  if (!VALID_RELATION_TYPES.has(type)) {
    warnings.push(`Ungültiger Relationstyp '${type}' wurde verworfen`);
    return null;
  }

  return {
    sourceClientId,
    targetClientId,
    type,
    confidence: clampNumber(raw.confidence, 0, 1, 0.5),
    rationale: truncate(safeString(raw.rationale).trim(), MAX_RATIONALE_LEN),
  };
}

/**
 * Parses the AI extraction response.
 *
 * Robust against:
 *   - fenced markdown JSON (```json ... ```)
 *   - bare JSON
 *   - the legacy "array only" format (older callers / older prompts)
 *   - extra/invalid fields
 *
 * Never throws.
 *
 * @param {string} responseText
 * @returns {{ artifacts: Array, relations: Array, warnings: string[], stats: object }}
 */
export function parseExtractionResponse(responseText) {
  const warnings = [];
  const schemas = buildTypeSchemas();
  const empty = {
    artifacts: [],
    relations: [],
    warnings,
    stats: { rawArtifactCount: 0, droppedArtifactCount: 0, droppedRelationCount: 0 },
  };

  const block = extractJsonBlock(responseText);
  if (!block) return empty;

  const parsed = tryParseJson(block);
  if (!parsed) return empty;

  // Accept either { artifacts, relations } or a bare array (legacy).
  let rawArtifacts;
  let rawRelations;
  if (Array.isArray(parsed)) {
    rawArtifacts = parsed;
    rawRelations = [];
  } else if (parsed && typeof parsed === "object") {
    rawArtifacts = Array.isArray(parsed.artifacts) ? parsed.artifacts : [];
    rawRelations = Array.isArray(parsed.relations) ? parsed.relations : [];
  } else {
    return empty;
  }

  // Sanitize artifacts and assign stable clientIds.
  const artifacts = [];
  let autoIdCounter = 1;
  for (const raw of rawArtifacts) {
    const a = sanitizeArtifact(raw, schemas, warnings);
    if (!a) continue;
    if (!a.clientId) a.clientId = `a${autoIdCounter}`;
    autoIdCounter += 1;
    artifacts.push(a);
  }

  // Ensure clientIds are unique within the response.
  const seenIds = new Set();
  const uniqueArtifacts = [];
  for (const a of artifacts) {
    let id = a.clientId;
    if (seenIds.has(id)) {
      id = `${id}-${seenIds.size}`;
    }
    seenIds.add(id);
    uniqueArtifacts.push({ ...a, clientId: id });
  }

  // Sanitize relations.
  const validIds = new Set(uniqueArtifacts.map((a) => a.clientId));
  const relations = [];
  let droppedRelationCount = 0;
  for (const raw of rawRelations) {
    const rel = sanitizeRelation(raw, validIds, warnings);
    if (rel) relations.push(rel);
    else droppedRelationCount += 1;
  }

  return {
    artifacts: uniqueArtifacts,
    relations,
    warnings,
    stats: {
      rawArtifactCount: rawArtifacts.length,
      droppedArtifactCount: rawArtifacts.length - uniqueArtifacts.length,
      droppedRelationCount,
    },
  };
}

// ─── Chunking ──────────────────────────────────────────────────────────────

/**
 * Splits long text into overlapping chunks. Prefers paragraph boundaries so we
 * do not cut sentences in half. Each chunk is roughly `chunkSize` chars long
 * with `overlap` chars of context from the previous chunk.
 *
 * @param {string} text
 * @param {{ chunkSize?: number, overlap?: number }} [opts]
 * @returns {string[]}
 */
export function chunkText(text, opts = {}) {
  const chunkSize = opts.chunkSize ?? DEFAULT_CHUNK_CHARS;
  const overlap = opts.overlap ?? DEFAULT_CHUNK_OVERLAP;
  if (typeof text !== "string" || !text.length) return [];
  if (text.length <= chunkSize) return [text];

  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let cut = end;
    if (end < text.length) {
      // Try to find a paragraph boundary in the last ~25% of the window.
      const windowStart = Math.max(start + Math.floor(chunkSize * 0.75), start);
      const lastBreak = text.lastIndexOf("\n\n", end);
      if (lastBreak >= windowStart) {
        cut = lastBreak;
      } else {
        const lastDot = text.lastIndexOf(". ", end);
        if (lastDot >= windowStart) cut = lastDot + 1;
      }
    }
    chunks.push(text.slice(start, cut));
    if (cut >= text.length) break;
    start = Math.max(cut - overlap, start + 1);
  }
  return chunks;
}

// ─── Merging across chunks ─────────────────────────────────────────────────

function dedupKey(a) {
  // Same type + same case-folded title is treated as a duplicate.
  return `${a.type}::${a.title.trim().toLowerCase()}`;
}

/**
 * Merges multiple parsed extraction results (e.g. from chunked analysis).
 * Deduplicates artifacts by (type, title) — keeping the one with the highest
 * confidence and richer evidence — and remaps relation clientIds accordingly.
 *
 * @param {Array<{ artifacts: Array, relations: Array, warnings?: string[], stats?: object }>} results
 * @returns {{ artifacts: Array, relations: Array, warnings: string[], stats: object }}
 */
export function mergeExtractionResults(results) {
  const warnings = [];
  const allArtifacts = [];
  const allRelations = [];

  // Re-id artifacts globally so we can detect duplicates across chunks. Each
  // chunk's clientIds are local; we map old → new id per chunk.
  results.forEach((res, chunkIdx) => {
    if (!res) return;
    if (Array.isArray(res.warnings)) warnings.push(...res.warnings);
    const localIdMap = new Map();
    for (const a of res.artifacts ?? []) {
      const newId = `c${chunkIdx}_${a.clientId}`;
      localIdMap.set(a.clientId, newId);
      allArtifacts.push({ ...a, clientId: newId });
    }
    for (const r of res.relations ?? []) {
      const src = localIdMap.get(r.sourceClientId);
      const tgt = localIdMap.get(r.targetClientId);
      if (!src || !tgt) continue;
      allRelations.push({ ...r, sourceClientId: src, targetClientId: tgt });
    }
  });

  // Deduplicate artifacts: keep the highest-confidence variant per (type, title).
  const byKey = new Map();
  const idRemap = new Map(); // dropped id → kept id
  for (const a of allArtifacts) {
    const key = dedupKey(a);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, a);
      continue;
    }
    // Pick the more confident; merge evidence.
    const winner = a.confidence > existing.confidence ? a : existing;
    const loser = a.confidence > existing.confidence ? existing : a;
    const mergedEvidence = [...(winner.evidence ?? [])];
    for (const e of loser.evidence ?? []) {
      if (mergedEvidence.length >= MAX_EVIDENCE_PER_ARTIFACT) break;
      if (!mergedEvidence.some((m) => m.quote === e.quote)) mergedEvidence.push(e);
    }
    const merged = { ...winner, evidence: mergedEvidence };
    byKey.set(key, merged);
    idRemap.set(loser.clientId, merged.clientId);
  }

  // Reassign final clientIds (a1, a2, ...) so downstream callers get a clean,
  // predictable shape.
  const finalArtifacts = [];
  const finalIdMap = new Map();
  let counter = 1;
  for (const a of byKey.values()) {
    const newId = `a${counter++}`;
    finalIdMap.set(a.clientId, newId);
    finalArtifacts.push({ ...a, clientId: newId });
  }
  // Chase indirect remaps (dropped → winner → final).
  for (const [dropped, winner] of idRemap.entries()) {
    if (!finalIdMap.has(dropped)) {
      const finalId = finalIdMap.get(winner);
      if (finalId) finalIdMap.set(dropped, finalId);
    }
  }

  const seenRel = new Set();
  const finalRelations = [];
  let droppedRelationCount = 0;
  for (const r of allRelations) {
    const src = finalIdMap.get(r.sourceClientId);
    const tgt = finalIdMap.get(r.targetClientId);
    if (!src || !tgt || src === tgt) {
      droppedRelationCount += 1;
      continue;
    }
    const key = `${src}::${tgt}::${r.type}`;
    if (seenRel.has(key)) continue;
    seenRel.add(key);
    finalRelations.push({ ...r, sourceClientId: src, targetClientId: tgt });
  }

  return {
    artifacts: finalArtifacts,
    relations: finalRelations,
    warnings,
    stats: {
      rawArtifactCount: allArtifacts.length,
      droppedArtifactCount: allArtifacts.length - finalArtifacts.length,
      droppedRelationCount,
    },
  };
}
