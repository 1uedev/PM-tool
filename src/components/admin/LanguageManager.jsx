"use client";

import { useState } from "react";
import { Check, Plus, Globe, Star, Eye, EyeOff, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function LanguageManager({ initialLanguages }) {
  const [languages, setLanguages] = useState(initialLanguages);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", nativeName: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function patch(code, data) {
    const res = await fetch(`/api/admin/languages/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message ?? "Fehler");
    return json.data;
  }

  async function handleToggleActive(lang) {
    if (lang.isDefault) {
      setError("Die Standardsprache kann nicht deaktiviert werden.");
      return;
    }
    try {
      const updated = await patch(lang.code, { isActive: !lang.isActive });
      setLanguages((prev) => prev.map((l) => (l.code === lang.code ? updated : l)));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSetDefault(lang) {
    try {
      const updated = await patch(lang.code, { isDefault: true });
      setLanguages((prev) =>
        prev.map((l) => (l.code === lang.code ? updated : { ...l, isDefault: false }))
      );
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  function handleDelete(lang) {
    setDeleteTarget(lang);
  }

  async function handleDeleteConfirm() {
    const lang = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/admin/languages/${lang.code}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Fehler");
      setLanguages((prev) => prev.filter((l) => l.code !== lang.code));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Fehler");
      setLanguages((prev) => [...prev, json.data].sort((a, b) => a.code.localeCompare(b.code)));
      setForm({ code: "", name: "", nativeName: "" });
      setShowAdd(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Language list */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {languages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-gray-500">
            <Globe className="h-8 w-8 text-gray-300" />
            <p>Keine Sprachen konfiguriert.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Nativ</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Standard</th>
                <th className="px-4 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {languages.map((lang) => (
                <tr key={lang.code} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">{lang.code}</td>
                  <td className="px-4 py-3 text-gray-700">{lang.name}</td>
                  <td className="px-4 py-3 text-gray-700">{lang.nativeName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                      ${lang.isActive
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}>
                      {lang.isActive ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {lang.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
                        <Check className="h-3 w-3" />
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!lang.isDefault && (
                        <button
                          onClick={() => handleSetDefault(lang)}
                          title="Als Standard setzen"
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleActive(lang)}
                        title={lang.isActive ? "Deaktivieren" : "Aktivieren"}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        {lang.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      {!lang.isDefault && (
                        <button
                          onClick={() => handleDelete(lang)}
                          title="Löschen"
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add language */}
      {showAdd ? (
        <form onSubmit={handleAdd} className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-900">Neue Sprache hinzufügen</h3>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Sprachcode *"
              type="text"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="z.B. fr, es, it"
              maxLength={5}
              required
            />
            <Input
              label="Name (Englisch) *"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="z.B. French"
              required
            />
            <Input
              label="Name (Nativ) *"
              type="text"
              value={form.nativeName}
              onChange={(e) => setForm((f) => ({ ...f, nativeName: e.target.value }))}
              placeholder="z.B. Français"
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setShowAdd(false); setForm({ code: "", name: "", nativeName: "" }); }}
            >
              Abbrechen
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Wird gespeichert..." : "Hinzufügen"}
            </Button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 self-start rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Sprache hinzufügen
        </button>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Sprache löschen"
        description={deleteTarget ? `Sprache „${deleteTarget.nativeName}" (${deleteTarget.code}) wirklich löschen?` : ""}
        confirmLabel="Löschen"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
