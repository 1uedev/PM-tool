"use client";

import { X, Sparkles } from "lucide-react";
import { ARTIFACT_FIELD_DEFS } from "@/lib/artifactFields.js";
import AiSuggestionItem from "./AiSuggestionItem.jsx";

export default function AiSuggestionPanel({ artifactType, suggestions, onAccept, onAcceptAll, onClose }) {
  const fieldDefs = ARTIFACT_FIELD_DEFS[artifactType] ?? [];
  const suggestedFields = suggestions.fields ?? {};

  // If we only have raw text (parse failed), show it directly
  if (suggestions.raw) {
    return (
      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-semibold text-purple-700">KI-Vorschlag</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestions.raw}</p>
      </div>
    );
  }

  // Filter to only fields that have suggestions
  const relevantDefs = fieldDefs.filter((def) => suggestedFields[def.key]);

  if (relevantDefs.length === 0) {
    return (
      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-gray-500">
        Keine verwertbaren Vorschläge erhalten.
        <button onClick={onClose} className="ml-2 text-purple-500 hover:underline">Schließen</button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-purple-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-semibold text-purple-700">KI-Vorschläge</span>
          <span className="text-xs text-gray-400">({relevantDefs.length} Felder)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAcceptAll}
            className="rounded-md bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
          >
            Alle übernehmen
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Suggestion items */}
      <div className="flex flex-col gap-2 p-4">
        {relevantDefs.map((def) => (
          <AiSuggestionItem
            key={def.key}
            fieldKey={def.key}
            label={def.label}
            value={suggestedFields[def.key]}
            onAccept={onAccept}
          />
        ))}
      </div>

      <p className="px-4 pb-3 text-xs text-gray-400">
        KI-Vorschläge werden erst übernommen, wenn du auf ✓ klickst oder „Alle übernehmen" wählst.
      </p>
    </div>
  );
}
