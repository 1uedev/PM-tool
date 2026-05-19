"use client";

import { useState } from "react";
import { LayoutTemplate, X } from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import Input from "@/components/ui/Input.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";

export default function SaveAsTemplateDialog({ project, artifacts }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [includeStarter, setIncludeStarter] = useState(true);
  const [selectedIds, setSelectedIds] = useState(
    new Set(artifacts.map((a) => a.id))
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function toggleArtifact(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === artifacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(artifacts.map((a) => a.id)));
    }
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          projectId: project.id,
          artifactIds: selectedIds.size < artifacts.length ? [...selectedIds] : undefined,
          includeStarter: project.prdStarter ? includeStarter : false,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Fehler beim Speichern");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Netzwerkfehler — bitte versuche es erneut");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setSuccess(false);
    setError("");
    setName(project.name);
    setDescription(project.description ?? "");
    setSelectedIds(new Set(artifacts.map((a) => a.id)));
    setIncludeStarter(true);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <LayoutTemplate className="h-4 w-4 text-gray-400" aria-hidden="true" />
        Als Vorlage speichern
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Als Vorlage speichern</h2>
              <button onClick={handleClose} aria-label="Schließen"
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <LayoutTemplate className="h-10 w-10 text-green-500" aria-hidden="true" />
                <p className="font-medium text-gray-800">Vorlage gespeichert!</p>
                <p className="text-sm text-gray-500">
                  Sie steht ab sofort beim Erstellen neuer Projekte zur Verfügung.
                </p>
                <Button onClick={handleClose}>Schließen</Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 overflow-y-auto px-6 py-4">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <Input
                    label="Vorlagenname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="z. B. SaaS-Produkt Grundstruktur"
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Beschreibung <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                    />
                  </div>

                  {project.prdStarter && (
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeStarter}
                        onChange={(e) => setIncludeStarter(e.target.checked)}
                        className="rounded"
                      />
                      Starter-Antworten einschließen
                    </label>
                  )}

                  {/* Artifact selection */}
                  {artifacts.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Artefakte ({selectedIds.size}/{artifacts.length})
                        </span>
                        <button
                          onClick={toggleAll}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {selectedIds.size === artifacts.length ? "Alle abwählen" : "Alle auswählen"}
                        </button>
                      </div>
                      <ul className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                        {artifacts.map((a) => (
                          <li key={a.id}>
                            <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(a.id)}
                                onChange={() => toggleArtifact(a.id)}
                                className="rounded flex-shrink-0"
                              />
                              <span className="truncate text-sm text-gray-800">{a.title}</span>
                              <span className="ml-auto flex-shrink-0 text-xs text-gray-400">
                                {ARTIFACT_TYPE_LABELS[a.type] ?? a.type}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                  <Button variant="secondary" onClick={handleClose} disabled={saving}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleSave} disabled={saving || !name.trim()}>
                    {saving ? <><Spinner className="h-4 w-4" />Speichern…</> : "Vorlage speichern"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
