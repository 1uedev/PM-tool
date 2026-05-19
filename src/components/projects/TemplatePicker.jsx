"use client";

import { LayoutTemplate, Check } from "lucide-react";

export default function TemplatePicker({ templates, selectedId, onSelect }) {
  if (!templates || templates.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-gray-700">Vorlage auswählen</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* "No template" option */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors
            ${!selectedId
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
            }`}
        >
          <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2
            ${!selectedId ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
            {!selectedId && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Ohne Vorlage</p>
            <p className="text-xs text-gray-500">Leeres Projekt erstellen</p>
          </div>
        </button>

        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors
              ${selectedId === t.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2
              ${selectedId === t.id ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
              {selectedId === t.id
                ? <Check className="h-3 w-3 text-white" aria-hidden="true" />
                : <LayoutTemplate className="h-3 w-3 text-gray-400" aria-hidden="true" />
              }
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">{t.name}</p>
              {t.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{t.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {t.artifactCount} Artefakt{t.artifactCount !== 1 ? "e" : ""}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
