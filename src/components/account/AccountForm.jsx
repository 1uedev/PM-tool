"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Input from "@/components/ui/Input.jsx";
import Button from "@/components/ui/Button.jsx";

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      {children}
    </div>
  );
}

function Banner({ type, message }) {
  if (!message) return null;
  const styles = type === "success"
    ? "border-green-200 bg-green-50 text-green-700"
    : "border-red-200 bg-red-50 text-red-700";
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${styles}`}>
      {type === "success" && <CheckCircle2 className="h-4 w-4 flex-shrink-0" />}
      {message}
    </div>
  );
}

export default function AccountForm({ user }) {
  // Profile section
  const [name, setName] = useState(user.name ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password section
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwErrors, setPwErrors] = useState({});
  const [pwError, setPwError] = useState("");

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess("");
    setProfileError("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) {
        setProfileError(json.error?.message ?? "Fehler beim Speichern");
        return;
      }
      setProfileSuccess("Profil gespeichert.");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch {
      setProfileError("Netzwerkfehler — bitte erneut versuchen");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    setPwErrors({});
    setPwError("");
    setPwSuccess("");

    if (newPassword !== confirmPassword) {
      setPwErrors({ confirmPassword: ["Passwörter stimmen nicht überein"] });
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error?.details) setPwErrors(json.error.details);
        else setPwError(json.error?.message ?? "Fehler beim Ändern");
        return;
      }
      setPwSuccess("Passwort erfolgreich geändert.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(""), 3000);
    } catch {
      setPwError("Netzwerkfehler — bitte erneut versuchen");
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Profile */}
      <Section title="Profil">
        <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
          <div>
            <Input
              label="Anzeigename"
              value={name}
              onChange={(e) => { setName(e.target.value); setProfileError(""); }}
              placeholder="Dein Name"
            />
          </div>
          <Input
            label="E-Mail-Adresse"
            value={user.email}
            disabled
          />
          <Banner type="error" message={profileError} />
          <Banner type="success" message={profileSuccess} />
          <div>
            <Button type="submit" disabled={profileSaving || !name.trim()}>
              {profileSaving ? "Wird gespeichert…" : "Speichern"}
            </Button>
          </div>
        </form>
      </Section>

      {/* Password */}
      <Section title="Passwort ändern">
        <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
          <Input
            label="Aktuelles Passwort"
            type="password"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setPwErrors({}); setPwError(""); }}
            placeholder="••••••••"
            error={pwErrors.currentPassword?.[0]}
          />
          <Input
            label="Neues Passwort"
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setPwErrors({}); }}
            placeholder="Mindestens 8 Zeichen"
            error={pwErrors.newPassword?.[0]}
          />
          <Input
            label="Neues Passwort bestätigen"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setPwErrors({}); }}
            placeholder="Wiederholen"
            error={pwErrors.confirmPassword?.[0]}
          />
          <Banner type="error" message={pwError} />
          <Banner type="success" message={pwSuccess} />
          <div>
            <Button
              type="submit"
              disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
            >
              {pwSaving ? "Wird gespeichert…" : "Passwort ändern"}
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
