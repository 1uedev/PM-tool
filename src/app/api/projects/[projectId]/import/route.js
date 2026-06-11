import prisma from "@/lib/prisma.js";
import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { consumeRateLimit } from "@/lib/rate-limit.js";
import { getAiConfig, getAiProvider, isAiAvailable } from "@/lib/ai/provider-factory.js";
import {
  buildExtractionPrompt,
  parseExtractionResponse,
  mergeExtractionResults,
  applyProposalLimit,
  buildRelationPassPrompt,
  parseRelationPassResponse,
  RELATION_PASS_SCHEMA,
  chunkText,
  getCanonicalExtractableTypes,
  getMissingSchemaTypes,
  DEFAULT_CHUNK_CHARS,
} from "@/lib/ai/document-extractor.js";
import { ARTIFACT_TYPE_ORDER } from "@/lib/constants.js";

// ─── Configurable limits ───────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

// Each import fans out into multiple AI calls — cap per user
const IMPORT_RATE_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 };
const MAX_TOTAL_CHARS = 250_000; // hard ceiling — anything beyond gets truncated with a warning
const SUPPORTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

// Hard ceiling for the user-provided proposal limit (0 = unlimited)
const MAX_PROPOSAL_LIMIT = 200;

// How many chunks are analyzed in parallel. Keeps large imports fast without
// hammering the provider's rate limits.
const CHUNK_CONCURRENCY = 3;

// Run fn over items with bounded concurrency; results keep the input order.
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}

// ─── Text extraction ───────────────────────────────────────────────────────

// The client-declared MIME type is spoofable — verify magic bytes before
// handing the buffer to a parser.
function matchesDeclaredType(buffer, mime) {
  if (mime === "application/pdf") {
    // "%PDF" must appear within the first 1024 bytes (per spec, leading
    // junk before the header is allowed)
    return buffer.subarray(0, 1024).includes("%PDF");
  }
  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    // DOCX is a ZIP container: "PK\x03\x04"
    return buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
  }
  // Plain text / markdown: reject binary content (NUL bytes)
  return !buffer.subarray(0, 8192).includes(0);
}

async function extractText(buffer, mime) {
  if (mime === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text ?? "";
  }

  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? "";
  }

  // Plain text / markdown
  return buffer.toString("utf-8");
}

// ─── Handler ───────────────────────────────────────────────────────────────

export const POST = withProjectRoute({ role: "EDITOR" }, async (request, { session, params }) => {
  const { projectId } = params;
  const rate = consumeRateLimit(`ai-import:${session.user.id}`, IMPORT_RATE_LIMIT);
  if (!rate.ok) {
    return errorResponse(
      "RATE_LIMITED",
      "Import-Limit erreicht (10 Importe pro Stunde) — bitte später erneut versuchen",
      429,
      { retryAfterSec: rate.retryAfterSec }
    );
  }

  // Check AI availability
  const aiConfig = await getAiConfig();
  if (!isAiAvailable(aiConfig)) {
    return errorResponse("SERVER_ERROR", "Kein KI-Provider konfiguriert", 503);
  }

  // Parse multipart form
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Ungültige Formulardaten", 400);
  }

  const files = formData.getAll("files");
  if (!files || files.length === 0) {
    return errorResponse("VALIDATION_ERROR", "Keine Dateien hochgeladen", 400);
  }

  // Optional extraction options: proposal cap + type scope
  const rawMax = formData.get("maxArtifacts");
  let maxArtifacts = 0; // 0 = unlimited
  if (typeof rawMax === "string" && rawMax.trim() !== "") {
    const parsed = parseInt(rawMax, 10);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > MAX_PROPOSAL_LIMIT) {
      return errorResponse(
        "VALIDATION_ERROR",
        `maxArtifacts muss eine Zahl zwischen 0 und ${MAX_PROPOSAL_LIMIT} sein`,
        400
      );
    }
    maxArtifacts = parsed;
  }

  const allExtractableTypes = getCanonicalExtractableTypes();
  const rawIncludeTypes = formData
    .getAll("includeTypes")
    .filter((t) => typeof t === "string" && t.trim() !== "");
  let includeTypes = null; // null = all types
  if (rawIncludeTypes.length > 0) {
    const validSet = new Set(allExtractableTypes);
    includeTypes = [...new Set(rawIncludeTypes)].filter((t) => validSet.has(t));
    if (includeTypes.length === 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "includeTypes enthält keine gültigen Artefakttypen",
        400
      );
    }
    // All types selected = no restriction
    if (includeTypes.length === allExtractableTypes.length) includeTypes = null;
  }
  if (files.length > MAX_FILES) {
    return errorResponse(
      "VALIDATION_ERROR",
      `Maximal ${MAX_FILES} Dateien pro Import erlaubt`,
      400
    );
  }

  // Validate files
  for (const file of files) {
    if (!(file instanceof File)) {
      return errorResponse("VALIDATION_ERROR", "Ungültiges Dateiformat", 400);
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return errorResponse(
        "VALIDATION_ERROR",
        `Datei '${file.name}' überschreitet das Limit von 10 MB`,
        400
      );
    }
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return errorResponse(
        "VALIDATION_ERROR",
        `Datei '${file.name}' hat ein nicht unterstütztes Format. Erlaubt: PDF, DOCX, TXT, MD`,
        400
      );
    }
  }

  // Extract text from all files (track per-file emptiness for better errors)
  const warnings = [];
  const perFileText = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!matchesDeclaredType(buffer, file.type)) {
      return errorResponse(
        "VALIDATION_ERROR",
        `Datei '${file.name}' entspricht nicht dem angegebenen Format`,
        400
      );
    }

    let text = "";
    try {
      text = await extractText(buffer, file.type);
    } catch (err) {
      console.error(`[import] extractText failed for '${file.name}':`, err);
      return errorResponse("SERVER_ERROR", "Fehler beim Lesen einer Datei", 500);
    }
    const trimmed = (text ?? "").trim();
    if (!trimmed) {
      if (file.type === "application/pdf") {
        warnings.push(
          `Aus '${file.name}' konnte kein Text extrahiert werden (möglicherweise eine gescannte PDF ohne OCR).`
        );
      } else {
        warnings.push(`Aus '${file.name}' konnte kein Text extrahiert werden.`);
      }
    }
    perFileText.push({ fileName: file.name, text });
  }

  // Combine with file separators so the model can attribute evidence quotes.
  let combinedText = perFileText
    .map(({ fileName, text }) => `\n\n--- ${fileName} ---\n\n${text}`)
    .join("");

  if (!combinedText.trim()) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Kein Textinhalt in den hochgeladenen Dateien gefunden. PDFs ohne eingebetteten Text (z. B. gescannt) werden nicht unterstützt.",
      400
    );
  }

  // Hard cap to avoid runaway API costs on huge uploads.
  if (combinedText.length > MAX_TOTAL_CHARS) {
    warnings.push(
      `Gesamttext überschreitet ${MAX_TOTAL_CHARS} Zeichen und wurde gekürzt. Bitte ggf. weniger oder kleinere Dateien hochladen.`
    );
    combinedText = combinedText.slice(0, MAX_TOTAL_CHARS);
  }

  // Chunk and analyze.
  const chunks = chunkText(combinedText, { chunkSize: DEFAULT_CHUNK_CHARS });
  const startMs = Date.now();
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let sawTokenUsage = false;
  let merged;
  try {
    const provider = getAiProvider(aiConfig);

    function trackUsage(usage) {
      if (typeof usage?.inputTokens === "number") {
        totalInputTokens += usage.inputTokens;
        sawTokenUsage = true;
      }
      if (typeof usage?.outputTokens === "number") {
        totalOutputTokens += usage.outputTokens;
      }
    }

    // Chunks are independent — analyze them in parallel (bounded).
    const chunkResults = await mapWithConcurrency(chunks, CHUNK_CONCURRENCY, async (chunk, i) => {
      const prompt = buildExtractionPrompt({
        documentText: chunk,
        chunkIndex: i,
        totalChunks: chunks.length,
        includeTypes,
        maxArtifacts,
      });
      const { text: responseText, usage } = await provider.extractFromDocument(prompt);
      trackUsage(usage);
      return parseExtractionResponse(responseText, { includeTypes });
    });

    // The prompt rule is only a soft cap per chunk — enforce the hard cap
    // across all chunks after merging (highest confidence wins).
    merged = applyProposalLimit(mergeExtractionResults(chunkResults), maxArtifacts);

    // Cross-chunk relation pass: per-chunk prompts can only link artifacts
    // within their own chunk. One cheap follow-up call over the merged
    // titles proposes relations across chunk boundaries. Non-fatal.
    if (chunks.length > 1 && merged.artifacts.length >= 2) {
      try {
        const { text, usage } = await provider.extractFromDocument(
          buildRelationPassPrompt(merged.artifacts),
          { schema: RELATION_PASS_SCHEMA }
        );
        trackUsage(usage);
        const validIds = new Set(merged.artifacts.map((a) => a.clientId));
        const { relations: extraRelations, warnings: relationWarnings } =
          parseRelationPassResponse(text, validIds);

        const seen = new Set(
          merged.relations.map((r) => `${r.sourceClientId}::${r.targetClientId}::${r.type}`)
        );
        for (const rel of extraRelations) {
          const key = `${rel.sourceClientId}::${rel.targetClientId}::${rel.type}`;
          if (seen.has(key)) continue;
          seen.add(key);
          merged.relations.push(rel);
        }
        merged.warnings.push(...relationWarnings);
      } catch (relErr) {
        console.error("[import] cross-chunk relation pass failed:", relErr);
        merged.warnings.push(
          "Die chunk-übergreifende Relationsanalyse ist fehlgeschlagen — Relationen sind ggf. unvollständig."
        );
      }
    }
  } catch (err) {
    console.error("[import] AI extraction error:", err);
    await prisma.aiSession.create({
      data: {
        provider: aiConfig.provider,
        mode: "import",
        prompt: `${files.length} Dateien / ${chunks.length} Chunks`,
        response: err.message ?? "error",
        projectId,
        userId: session.user.id,
        durationMs: Date.now() - startMs,
        inputTokens: sawTokenUsage ? totalInputTokens : null,
        outputTokens: sawTokenUsage ? totalOutputTokens : null,
      },
    }).catch(() => {});
    return errorResponse("SERVER_ERROR", "KI-Analyse fehlgeschlagen", 500);
  }

  // Log the import run (project-level — no single artifact to attach to)
  await prisma.aiSession.create({
    data: {
      provider: aiConfig.provider,
      mode: "import",
      prompt: `${files.length} Dateien / ${chunks.length} Chunks` +
        (maxArtifacts ? ` / Limit ${maxArtifacts}` : "") +
        (includeTypes ? ` / ${includeTypes.length} Typen` : ""),
      response: JSON.stringify({
        proposedArtifactCount: merged.artifacts.length,
        relationCount: merged.relations.length,
        warningCount: merged.warnings.length,
      }),
      projectId,
      userId: session.user.id,
      durationMs: Date.now() - startMs,
      inputTokens: sawTokenUsage ? totalInputTokens : null,
      outputTokens: sawTokenUsage ? totalOutputTokens : null,
    },
  }).catch(() => {});

  // Coverage stats — over the types in scope for this run.
  const extractableTypes = includeTypes ?? allExtractableTypes;
  const canonicalTypeCount = ARTIFACT_TYPE_ORDER.length;
  const coveredTypes = new Set(merged.artifacts.map((a) => a.type));
  const coveredTypeCount = coveredTypes.size;
  const missingTypes = extractableTypes.filter((t) => !coveredTypes.has(t));

  // Surface schema gaps so they are visible in the UI / logs.
  const missingSchemaTypes = getMissingSchemaTypes();
  if (missingSchemaTypes.length > 0) {
    warnings.push(
      `${missingSchemaTypes.length} kanonische Artefakttypen haben kein Feldschema und wurden vom Import übersprungen: ${missingSchemaTypes.join(", ")}`
    );
  }

  // Combine merger warnings with our own.
  const allWarnings = [...warnings, ...(merged.warnings ?? [])];

  return successResponse({
    proposals: merged.artifacts,
    relations: merged.relations,
    fileCount: files.length,
    stats: {
      canonicalTypeCount,
      extractableTypeCount: extractableTypes.length,
      proposedArtifactCount: merged.artifacts.length,
      coveredTypeCount,
      missingTypes,
      chunkCount: chunks.length,
      maxArtifacts: maxArtifacts || null,
      includeTypes,
      warnings: allWarnings,
    },
  });
});
