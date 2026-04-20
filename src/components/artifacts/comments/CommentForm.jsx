"use client";

import { useState } from "react";
import Button from "@/components/ui/Button.jsx";
import Spinner from "@/components/ui/Spinner.jsx";

export default function CommentForm({ projectId, artifactId, onAdded }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch(
        `/api/projects/${projectId}/artifacts/${artifactId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim() }),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message ?? "Fehler beim Speichern");
        return;
      }

      setContent("");
      onAdded(json.data);
    } catch {
      setError("Netzwerkfehler — bitte versuche es erneut");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-3">
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setError(""); }}
        placeholder="Kommentar schreiben…"
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none resize-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving || !content.trim()}>
          {saving ? <><Spinner className="h-4 w-4" /> Senden…</> : "Kommentieren"}
        </Button>
      </div>
    </form>
  );
}
