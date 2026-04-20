"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { ARTIFACT_STATUS_LABELS, ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";
import { ARTIFACT_FIELD_DEFS, getDefaultFields } from "@/lib/artifactFields.js";
import Input from "@/components/ui/Input.jsx";
import Select from "@/components/ui/Select.jsx";
import Button from "@/components/ui/Button.jsx";
import Spinner from "@/components/ui/Spinner.jsx";

const STATUS_OPTIONS = Object.entries(ARTIFACT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function ArtifactForm({ artifact, type, projectId, onSaved }) {
  const router = useRouter();
  const isEdit = !!artifact;

  const [title, setTitle] = useState(artifact?.title ?? "");
  const [status, setStatus] = useState(artifact?.status ?? "DRAFT");
  const [fields, setFields] = useState(
    artifact?.fields ?? getDefaultFields(type ?? artifact?.type)
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [saved, setSaved] = useState(false);

  const artifactType = type ?? artifact?.type;
  const fieldDefs = ARTIFACT_FIELD_DEFS[artifactType] ?? [];

  function setField(key, value) {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  const validate = useCallback(() => {
    const errs = {};
    if (!title.trim()) errs.title = "Titel ist erforderlich";
    return errs;
  }, [title]);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    setGlobalError("");
    setSaved(false);

    try {
      const url = isEdit
        ? `/api/projects/${projectId}/artifacts/${artifact.id}`
        : `/api/projects/${projectId}/artifacts`;
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? { title, status, fields }
        : { type: artifactType, title, status, fields };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.error?.details) {
          setErrors(Object.fromEntries(
            Object.entries(json.error.details).map(([k, v]) => [k, v[0]])
          ));
        } else {
          setGlobalError(json.error?.message ?? "Fehler beim Speichern");
        }
        return;
      }

      // Invalidate artifact list so tree refreshes
      mutate(`/api/projects/${projectId}/artifacts`);

      if (isEdit) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onSaved?.(json.data);
      } else {
        // Navigate to the newly created artifact
        const params = new URLSearchParams();
        params.set("artifact", json.data.id);
        router.push(`/projects/${projectId}?${params.toString()}`);
        router.refresh();
      }
    } catch {
      setGlobalError("Netzwerkfehler — bitte versuche es erneut");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full" noValidate>
      {/* Header row: title + status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Input
            label="Titel"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((err) => ({ ...err, title: undefined })); }}
            error={errors.title}
            placeholder={`${ARTIFACT_TYPE_LABELS[artifactType] ?? "Artefakt"} benennen…`}
            autoFocus={!isEdit}
          />
        </div>
        <div className="w-36 flex-shrink-0">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {globalError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      )}

      {/* Type-specific fields */}
      <div className="flex flex-col gap-4 flex-1">
        {fieldDefs.map((def) => (
          <div key={def.key} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{def.label}</label>
            {def.multiline ? (
              <textarea
                value={fields[def.key] ?? ""}
                onChange={(e) => setField(def.key, e.target.value)}
                rows={def.rows ?? 3}
                placeholder={def.placeholder}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-y"
              />
            ) : (
              <Input
                value={fields[def.key] ?? ""}
                onChange={(e) => setField(def.key, e.target.value)}
                placeholder={def.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <><Spinner className="w-4 h-4" />{isEdit ? "Speichern…" : "Erstellen…"}</>
          ) : (
            isEdit ? "Speichern" : "Artefakt erstellen"
          )}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">✓ Gespeichert</span>
        )}
        {!isEdit && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Abbrechen
          </Button>
        )}
      </div>
    </form>
  );
}
