"use client";

import { useState } from "react";
import { Download, FileJson, FileText } from "lucide-react";
import Spinner from "@/components/ui/Spinner.jsx";

async function triggerDownload(url, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Export fehlgeschlagen");
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}

export default function ExportSection({ projectId, projectName }) {
  const [loading, setLoading] = useState(null); // "json" | "csv" | null
  const [error, setError] = useState("");

  const slug = projectName.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  async function handleExport(format) {
    setLoading(format);
    setError("");
    try {
      await triggerDownload(
        `/api/projects/${projectId}/export?format=${format}`,
        `${slug}_export.${format}`
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">
        Alle Artefakte des Projekts als Datei herunterladen.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => handleExport("json")}
          disabled={!!loading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading === "json" ? <Spinner className="h-4 w-4" /> : <FileJson className="h-4 w-4 text-blue-500" />}
          JSON exportieren
        </button>
        <button
          onClick={() => handleExport("csv")}
          disabled={!!loading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading === "csv" ? <Spinner className="h-4 w-4" /> : <FileText className="h-4 w-4 text-green-500" />}
          CSV exportieren
        </button>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
