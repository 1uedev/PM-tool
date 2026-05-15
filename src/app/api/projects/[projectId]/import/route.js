import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { getAiConfig, getAiProvider, isAiAvailable } from "@/lib/ai/provider-factory.js";
import {
  buildExtractionPrompt,
  parseExtractionResponse,
  mergeExtractionResults,
  chunkText,
  getCanonicalExtractableTypes,
  getMissingSchemaTypes,
  DEFAULT_CHUNK_CHARS,
} from "@/lib/ai/document-extractor.js";
import { ARTIFACT_TYPE_ORDER } from "@/lib/constants.js";

// ─── Configurable limits ───────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;
const MAX_TOTAL_CHARS = 250_000; // hard ceiling — anything beyond gets truncated with a warning
const SUPPORTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

// ─── Text extraction ───────────────────────────────────────────────────────

async function extractText(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type;

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

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return errorResponse("AUTH_ERROR", "Nicht authentifiziert", 401);

  const { projectId } = await params;
  const { response: accessErr } = await requireProjectAccess(
    session.user.id,
    projectId,
    "EDITOR"
  );
  if (accessErr) return accessErr;

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
    let text = "";
    try {
      text = await extractText(file);
    } catch (err) {
      return errorResponse(
        "SERVER_ERROR",
        `Fehler beim Lesen der Datei '${file.name}': ${err.message}`,
        500
      );
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
  let merged;
  try {
    const provider = getAiProvider(aiConfig);
    const chunkResults = [];
    for (let i = 0; i < chunks.length; i++) {
      const prompt = buildExtractionPrompt({
        documentText: chunks[i],
        chunkIndex: i,
        totalChunks: chunks.length,
      });
      const responseText = await provider.extractFromDocument(prompt);
      const parsed = parseExtractionResponse(responseText);
      chunkResults.push(parsed);
    }
    merged = mergeExtractionResults(chunkResults);
  } catch (err) {
    console.error("[import] AI extraction error:", err);
    return errorResponse("SERVER_ERROR", "KI-Analyse fehlgeschlagen: " + err.message, 500);
  }

  // Coverage stats — over canonical types that actually have a schema.
  const extractableTypes = getCanonicalExtractableTypes();
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
      warnings: allWarnings,
    },
  });
}
