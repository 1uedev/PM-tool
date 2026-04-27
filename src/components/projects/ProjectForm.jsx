"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input.jsx";
import Button from "@/components/ui/Button.jsx";
import Spinner from "@/components/ui/Spinner.jsx";

export default function ProjectForm({ project }) {
  const router = useRouter();
  const isEdit = !!project;

  const [values, setValues] = useState({
    name: project?.name ?? "",
    description: project?.description ?? "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  function handleChange(e) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: undefined }));
    setGlobalError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!values.name.trim()) {
      setErrors({ name: "Name ist erforderlich" });
      return;
    }

    setLoading(true);
    try {
      const url = isEdit
        ? `/api/projects/${project.id}`
        : "/api/projects";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error?.details) {
          setErrors(
            Object.fromEntries(
              Object.entries(json.error.details).map(([k, v]) => [k, v[0]])
            )
          );
        } else {
          setGlobalError(json.error?.message ?? "Fehler beim Speichern");
        }
        return;
      }

      if (isEdit) {
        router.push(`/projects/${json.data.id}`);
      } else {
        router.push(`/projects/${json.data.id}/starter`);
      }
      router.refresh();
    } catch {
      setGlobalError("Netzwerkfehler — bitte versuche es erneut");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      {globalError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      )}

      <Input
        label="Projektname"
        name="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="z. B. Smart Home App"
        autoFocus
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Beschreibung <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          rows={4}
          placeholder="Worum geht es in diesem Projekt?"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner className="w-4 h-4" />
              {isEdit ? "Speichern…" : "Erstellen…"}
            </>
          ) : (
            isEdit ? "Speichern" : "Projekt erstellen"
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
