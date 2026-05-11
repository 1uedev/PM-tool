"use client";

import { useState } from "react";
import { UserPlus, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import Input from "@/components/ui/Input.jsx";
import Select from "@/components/ui/Select.jsx";

const ROLE_OPTIONS = [
  { value: "VIEWER", label: "Viewer" },
  { value: "EDITOR", label: "Editor" },
  { value: "OWNER", label: "Owner" },
];

export default function InviteMember({ projectId, onInvited }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EDITOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Fehler beim Hinzufügen");
        return;
      }
      setSuccess(`${json.data.user.name || json.data.user.email} wurde hinzugefügt.`);
      setEmail("");
      onInvited?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(""); }}
            placeholder="E-Mail-Adresse"
            required
          />
        </div>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={ROLE_OPTIONS}
          className="w-32"
        />
        <Button type="submit" disabled={loading || !email.trim()}>
          {loading ? "…" : <><UserPlus className="h-4 w-4" /> Hinzufügen</>}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}
    </form>
  );
}
