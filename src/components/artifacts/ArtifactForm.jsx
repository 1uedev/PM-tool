"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { ARTIFACT_STATUS_LABELS, ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";
import { getDefaultFields } from "@/lib/artifactFields.js";
import { FIELD_COMPONENTS } from "@/components/artifacts/fields/index.js";
import { useDirtyForm } from "@/lib/DirtyFormContext.js";
import { useProjectRole, hasRole } from "@/lib/ProjectRoleContext.js";
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
  const { setDirty } = useDirtyForm();
  const role = useProjectRole();
  const canEdit = hasRole(role, "EDITOR");
  const isEdit = !!artifact;
  const artifactType = type ?? artifact?.type;

  const [title, setTitle] = useState(artifact?.title ?? "");
  const [status, setStatus] = useState(artifact?.status ?? "DRAFT");
  const [fields, setFields] = useState(
    artifact?.fields ?? getDefaultFields(artifactType)
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [saved, setSaved] = useState(false);

  // Reset form state when switching to a different artifact
  useEffect(() => {
    setTitle(artifact?.title ?? "");
    setStatus(artifact?.status ?? "DRAFT");
    setFields(artifact?.fields ?? getDefaultFields(artifactType));
    setErrors({});
    setGlobalError("");
    setSaved(false);
    setDirty(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifact?.id]);

  // Clear dirty on unmount
  useEffect(() => () => setDirty(false), [setDirty]);

  function markDirty() {
    setDirty(true);
    setSaved(false);
  }

  function handleTitleChange(e) {
    setTitle(e.target.value);
    setErrors((err) => ({ ...err, title: undefined }));
    markDirty();
  }

  function handleStatusChange(e) {
    setStatus(e.target.value);
    markDirty();
  }

  function handleFieldChange(key, value) {
    setFields((f) => ({ ...f, [key]: value }));
    markDirty();
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

      setDirty(false);
      mutate(`/api/projects/${projectId}/artifacts`);

      if (isEdit) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onSaved?.(json.data);
      } else {
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

  const FieldsComponent = FIELD_COMPONENTS[artifactType];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full" noValidate>
      {/* Header: title + status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Input
            label="Titel"
            value={title}
            onChange={handleTitleChange}
            error={errors.title}
            placeholder={`${ARTIFACT_TYPE_LABELS[artifactType] ?? "Artefakt"} benennen…`}
            autoFocus={!isEdit}
            disabled={!canEdit}
          />
        </div>
        <div className="w-36 flex-shrink-0">
          <Select
            label="Status"
            value={status}
            onChange={handleStatusChange}
            options={STATUS_OPTIONS}
            disabled={!canEdit}
          />
        </div>
      </div>

      {globalError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      )}

      {/* Type-specific field component */}
      <div className="flex-1">
        {FieldsComponent ? (
          <FieldsComponent fields={fields} onChange={handleFieldChange} disabled={!canEdit} />
        ) : (
          <p className="text-sm text-gray-400 italic">
            Keine Felder für Typ "{artifactType}" definiert.
          </p>
        )}
      </div>

      {/* Actions — only for EDITOR+ */}
      {canEdit && (
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
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Abbrechen
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
