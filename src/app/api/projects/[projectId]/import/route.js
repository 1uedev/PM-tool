import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { getAiConfig, getAiProvider, isAiAvailable } from "@/lib/ai/provider-factory.js";
import { buildExtractionPrompt, parseExtractionResponse } from "@/lib/ai/document-extractor.js";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

async function extractText(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type;

  if (mime === "application/pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Plain text / markdown
  return buffer.toString("utf-8");
}

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return errorResponse("AUTH_ERROR", "Nicht authentifiziert", 401);

  const { projectId } = await params;
  const { membership, response: accessErr } = await requireProjectAccess(
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

  // Validate files
  for (const file of files) {
    if (!(file instanceof File)) {
      return errorResponse("VALIDATION_ERROR", "Ungültiges Dateiformat", 400);
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return errorResponse("VALIDATION_ERROR", `Datei '${file.name}' überschreitet das Limit von 10 MB`, 400);
    }
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return errorResponse(
        "VALIDATION_ERROR",
        `Datei '${file.name}' hat ein nicht unterstütztes Format. Erlaubt: PDF, DOCX, TXT, MD`,
        400
      );
    }
  }

  // Extract text from all files
  let combinedText = "";
  for (const file of files) {
    try {
      const text = await extractText(file);
      combinedText += `\n\n--- ${file.name} ---\n\n${text}`;
    } catch (err) {
      return errorResponse(
        "SERVER_ERROR",
        `Fehler beim Lesen der Datei '${file.name}': ${err.message}`,
        500
      );
    }
  }

  if (!combinedText.trim()) {
    return errorResponse("VALIDATION_ERROR", "Kein Textinhalt in den hochgeladenen Dateien gefunden", 400);
  }

  // Call AI for extraction
  try {
    const provider = getAiProvider(aiConfig);
    const prompt = buildExtractionPrompt(combinedText);

    // Use raw API call pattern (provider-agnostic via adapter)
    const responseText = await provider.extractFromDocument(prompt);
    const proposals = parseExtractionResponse(responseText);

    return successResponse({ proposals, fileCount: files.length });
  } catch (err) {
    console.error("[import] AI extraction error:", err);
    return errorResponse("SERVER_ERROR", "KI-Analyse fehlgeschlagen: " + err.message, 500);
  }
}
