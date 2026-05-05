"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import Spinner from "@/components/ui/Spinner.jsx";
import AiSuggestionPanel from "./AiSuggestionPanel.jsx";

export default function AiSuggestButton({ projectId, artifactId, artifactType, onAccept }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState("");

  async function handleRequest() {
    setLoading(true);
    setError("");
    setSuggestions(null);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/artifacts/${artifactId}/ai`,
        { method: "POST" }
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message ?? "KI-Anfrage fehlgeschlagen");
        return;
      }

      setSuggestions(json.data);
    } catch {
      setError("Netzwerkfehler — bitte erneut versuchen");
    } finally {
      setLoading(false);
    }
  }

  function handleAccept(fieldKey, value) {
    onAccept(fieldKey, value);
    // Remove accepted field from suggestions
    setSuggestions((prev) => {
      if (!prev?.fields) return prev;
      const remaining = { ...prev.fields };
      delete remaining[fieldKey];
      return Object.keys(remaining).length > 0 ? { ...prev, fields: remaining } : null;
    });
  }

  function handleAcceptAll() {
    if (suggestions?.fields) {
      Object.entries(suggestions.fields).forEach(([key, value]) => {
        if (value) onAccept(key, value);
      });
    }
    setSuggestions(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleRequest}
        disabled={loading}
        className="flex items-center gap-2 self-start rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 transition-colors hover:border-purple-300 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Spinner className="h-4 w-4 text-purple-500" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? "KI denkt nach…" : "KI-Vorschläge"}
      </button>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {suggestions && (
        <AiSuggestionPanel
          artifactType={artifactType}
          suggestions={suggestions}
          onAccept={handleAccept}
          onAcceptAll={handleAcceptAll}
          onClose={() => setSuggestions(null)}
        />
      )}
    </div>
  );
}
