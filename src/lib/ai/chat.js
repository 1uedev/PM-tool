// AI content chat: schema, system-prompt builder and a defensive result
// parser. The chat lets a user understand why an AI-generated artifact was
// produced and propose concrete, confirm-before-apply changes to its fields.
//
// Message shape (kept in client React state only — NOT persisted). Structured
// deliberately so a future ChatSession/ChatMessage model can adopt it:
//   { id: string, role: "user" | "assistant" | "system",
//     content: string, proposal?: ChangeProposal | null }
//   ChangeProposal = { field: string, newValue: string, rationale: string }

// JSON schema for one assistant turn. Claude uses this via forced tool use;
// OpenAI/Ollama use JSON mode with the shape described in the prompt.
export const CHAT_RESULT_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    proposal: {
      type: ["object", "null"],
      properties: {
        field: { type: "string" },
        newValue: { type: "string" },
        rationale: { type: "string" },
      },
      required: ["field", "newValue"],
    },
  },
  required: ["reply"],
};

const ORIGIN_LABELS = {
  suggest: "über die KI-Vorschlagsfunktion (Feld für Feld)",
  import: "durch KI-Analyse eines hochgeladenen Dokuments",
  chat: "durch eine frühere KI-Chat-Änderung",
};

const LANGUAGE_NAMES = {
  de: "Deutsch",
  en: "Englisch",
  fr: "Französisch",
  es: "Spanisch",
  it: "Italienisch",
};

/**
 * Builds the system prompt that grounds the chat in the real artifact:
 * its current content, the reconstructed original generation prompt, related
 * context and how it was created.
 *
 * @param {object} p
 * @param {{ type: string, title: string, fields: object }} p.artifact
 * @param {Array<{ key: string, label: string }>} p.fieldDefs
 * @param {string} p.originalPrompt - reconstructed generation prompt ("" if none)
 * @param {string} p.context - related-artifact context ("" if none)
 * @param {string|null} p.origin - "suggest" | "import" | "chat" | null
 * @param {string} p.language - target output language code (e.g. "de")
 */
export function buildChatSystemPrompt({ artifact, fieldDefs, originalPrompt, context, origin, language = "de" }) {
  const langName = LANGUAGE_NAMES[language] ?? language;
  const fieldLines = fieldDefs
    .map((f) => `- ${f.key} (${f.label}): ${String(artifact.fields?.[f.key] ?? "").trim() || "(leer)"}`)
    .join("\n");
  const validKeys = [...fieldDefs.map((f) => f.key), "title"];
  const originSentence = origin && ORIGIN_LABELS[origin]
    ? `Dieses Artefakt wurde ursprünglich ${ORIGIN_LABELS[origin]} erzeugt.`
    : "Dieses Artefakt enthält KI-generierte Inhalte.";

  return `Du bist ein erfahrener Product-Management-Assistent. Du hilfst einem Nutzer, ein konkretes PM-Artefakt zu verstehen und gezielt zu verbessern.

${originSentence}

ARTEFAKT
Typ: ${artifact.type}
Titel: ${artifact.title}
Felder:
${fieldLines}

${originalPrompt ? `URSPRÜNGLICHER GENERIERUNGS-PROMPT (zur Erklärung, warum der Inhalt so erzeugt wurde):\n${originalPrompt}\n` : ""}
${context ? `VERKNÜPFTER PROJEKTKONTEXT:\n${context}\n` : ""}
DEINE AUFGABE
1. Erkläre klar und konkret, warum und wie der Inhalt so erzeugt wurde — beziehe dich auf die tatsächlichen Feldwerte und den Kontext oben.
2. Beantworte Rückfragen zum Inhalt, zum Produkt und zum Kontext.
3. Wenn der Nutzer eine konkrete Verbesserung wünscht (oder du eine klar sinnvolle vorschlägst), liefere GENAU EINEN strukturierten Änderungsvorschlag.

ANTWORTFORMAT — gib ausschließlich gültiges JSON in dieser Form zurück:
{
  "reply": "deine Gesprächsantwort an den Nutzer",
  "proposal": { "field": "<feldschlüssel>", "newValue": "<neuer vollständiger Wert>", "rationale": "<kurze Begründung>" }
}
- "proposal" ist null, wenn keine Änderung vorgeschlagen wird.
- "field" MUSS einer dieser Schlüssel sein: ${validKeys.join(", ")}.
- "newValue" ist der vollständige neue Feldinhalt (kein Diff, kein Teilstück).
- Schlage nie mehr als ein Feld pro Antwort vor.
- Schreibe "reply" und "rationale" auf ${langName}.
- Kein Text außerhalb des JSON.`;
}

function clampString(v, max) {
  const s = typeof v === "string" ? v : "";
  return s.length > max ? s.slice(0, max) : s;
}

/**
 * Defensively turns a raw model result into { reply, proposal }.
 * Drops a proposal whose field is not in validFieldKeys (+ "title").
 * Never throws.
 */
export function parseChatResult(raw, validFieldKeys = []) {
  if (!raw || typeof raw !== "object") {
    return { reply: "", proposal: null };
  }
  const reply = clampString(raw.reply, 8000);

  let proposal = null;
  const allowed = new Set([...validFieldKeys, "title"]);
  const p = raw.proposal;
  if (p && typeof p === "object") {
    const field = typeof p.field === "string" ? p.field.trim() : "";
    const newValue = typeof p.newValue === "string" ? p.newValue : "";
    if (allowed.has(field) && newValue.length > 0) {
      proposal = {
        field,
        newValue: clampString(newValue, field === "title" ? 200 : 4000),
        rationale: clampString(p.rationale, 600),
      };
    }
  }

  return { reply, proposal };
}
