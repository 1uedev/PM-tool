"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import Input from "@/components/ui/Input.jsx";
import Select from "@/components/ui/Select.jsx";

const ROLE_LABELS = {
  ADMIN: "Administrator",
  USER: "Benutzer",
};

const STATUS_LABELS = {
  ACTIVE: "Aktiv",
  INACTIVE: "Inaktiv",
};

export default function UserForm({ user, onSuccess }) {
  const router = useRouter();
  const isEdit = !!user;

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    password: "",
    systemRole: user?.systemRole ?? "USER",
    status: user?.status ?? "ACTIVE",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [saved, setSaved] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);

    const body = { ...form };
    if (isEdit && !body.password) delete body.password;

    const url = isEdit ? `/api/admin/users/${user.id}` : "/api/admin/users";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.error?.details) setErrors(json.error.details);
        else setServerError(json.error?.message ?? "Unbekannter Fehler");
        return;
      }

      setSaved(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(json.data);
        else router.push("/admin/users");
      }, 800);
    } catch {
      setServerError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {isEdit ? "Änderungen gespeichert" : "Benutzer angelegt"}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vorname <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            placeholder="Max"
            error={errors.firstName?.[0]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nachname <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            placeholder="Mustermann"
            error={errors.lastName?.[0]}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          E-Mail-Adresse <span className="text-red-500">*</span>
        </label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="max@beispiel.de"
          error={errors.email?.[0]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Passwort {isEdit ? "(leer lassen = nicht ändern)" : <span className="text-red-500">*</span>}
        </label>
        <Input
          type="password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          placeholder={isEdit ? "Neues Passwort (optional)" : "Mindestens 8 Zeichen"}
          error={errors.password?.[0]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Rolle"
          value={form.systemRole}
          onChange={(e) => set("systemRole", e.target.value)}
          options={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
          options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Wird gespeichert…" : isEdit ? "Änderungen speichern" : "Benutzer anlegen"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/users")}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
