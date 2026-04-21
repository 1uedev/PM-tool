"use client";

import { Check } from "lucide-react";

export default function AiSuggestionItem({ fieldKey, label, value, onAccept }) {
  if (!value) return null;

  return (
    <div className="group flex gap-3 rounded-lg border border-purple-100 bg-purple-50 p-3">
      <div className="flex-1 min-w-0">
        <p className="mb-1 text-xs font-semibold text-purple-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{value}</p>
      </div>
      <button
        onClick={() => onAccept(fieldKey, value)}
        title="Vorschlag übernehmen"
        className="flex-shrink-0 self-start rounded-lg border border-purple-200 bg-white p-1.5 text-purple-500 transition-colors hover:border-purple-400 hover:bg-purple-100"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
