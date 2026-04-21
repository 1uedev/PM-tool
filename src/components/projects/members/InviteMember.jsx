"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import Spinner from "@/components/ui/Spinner.jsx";

const ROLE_LABELS = { VIEWER: "Viewer", EDITOR: "Editor", OWNER: "Owner" };

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
        setError(json.error?.message ?? "Fehler beim Einladen");
        return;
      }
      setSuccess(`${json.data.user.name || json.data.user.email} wurde als ${ROLE_LABELS[role]} hinzugefügt.`);
      setEmail("");
      onInvited?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(""); }}
          placeholder="E-Mail-Adresse"
          required
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Spinner className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          Hinzufügen
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
    </form>
  );
}
