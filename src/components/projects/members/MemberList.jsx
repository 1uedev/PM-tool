"use client";

import { useState } from "react";
import useSWR from "swr";
import { Trash2, Crown, Eye, Pencil } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog.jsx";
import Spinner from "@/components/ui/Spinner.jsx";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((d) => d.data ?? []);

const ROLE_LABELS = { OWNER: "Owner", EDITOR: "Editor", VIEWER: "Viewer" };
const ROLE_ICONS = {
  OWNER: <Crown className="h-3.5 w-3.5 text-yellow-500" />,
  EDITOR: <Pencil className="h-3.5 w-3.5 text-blue-500" />,
  VIEWER: <Eye className="h-3.5 w-3.5 text-gray-400" />,
};

function Initials({ name, email }) {
  const str = name || email || "?";
  const parts = str.split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : str.slice(0, 2).toUpperCase();
}

export default function MemberList({ projectId, isOwner = false }) {
  const { data: members = [], mutate, isLoading } = useSWR(
    `/api/projects/${projectId}/members`,
    fetcher
  );

  const [roleLoading, setRoleLoading] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRoleChange(memberId, newRole) {
    setRoleLoading(memberId);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message ?? "Fehler beim Ändern der Rolle"); return; }
      mutate();
    } finally {
      setRoleLoading(null);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${deleteConfirm.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message ?? "Fehler beim Entfernen"); return; }
      mutate();
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(null);
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-6"><Spinner className="h-5 w-5" /></div>;
  }

  return (
    <>
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 px-4 py-3">
            {/* Avatar */}
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
              <Initials name={member.user.name} email={member.user.email} />
            </div>

            {/* User info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {member.user.name || member.user.email}
                {member.isCurrentUser && (
                  <span className="ml-1.5 text-xs font-normal text-gray-400">(du)</span>
                )}
              </p>
              <p className="truncate text-xs text-gray-400">{member.user.email}</p>
            </div>

            {/* Role — editable for owners, read-only label otherwise */}
            <div className="flex items-center gap-1.5">
              {ROLE_ICONS[member.role]}
              {isOwner ? (
                roleLoading === member.id ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="rounded-md border border-gray-200 py-1 pl-2 pr-6 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VIEWER">{ROLE_LABELS.VIEWER}</option>
                    <option value="EDITOR">{ROLE_LABELS.EDITOR}</option>
                    <option value="OWNER">{ROLE_LABELS.OWNER}</option>
                  </select>
                )
              ) : (
                <span className="text-xs text-gray-500">{ROLE_LABELS[member.role]}</span>
              )}
            </div>

            {/* Remove — owner only */}
            {isOwner && (
              <button
                onClick={() => setDeleteConfirm(member)}
                title="Mitglied entfernen"
                className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Mitglied entfernen?"
        description={`${deleteConfirm?.user.name || deleteConfirm?.user.email} wird aus dem Projekt entfernt.`}
        confirmLabel="Entfernen"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
