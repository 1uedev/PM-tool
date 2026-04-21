"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, UserX, UserCheck, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge.jsx";
import ConfirmDialog from "@/components/ui/ConfirmDialog.jsx";

const ROLE_LABELS = { ADMIN: "Administrator", USER: "Benutzer" };
const ROLE_VARIANTS = { ADMIN: "blue", USER: "gray" };

export default function UserList({ users, currentUserId }) {
  const router = useRouter();
  const [confirmUser, setConfirmUser] = useState(null);
  const [loading, setLoading] = useState(null);

  async function handleDeactivate(user) {
    setLoading(user.id);
    try {
      await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(null);
      setConfirmUser(null);
    }
  }

  async function handleReactivate(user) {
    setLoading(user.id);
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (!users.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <p className="text-sm text-gray-500">Noch keine Benutzer vorhanden.</p>
        <Link
          href="/admin/users/new"
          className="mt-3 inline-block text-sm text-blue-600 hover:underline"
        >
          Ersten Benutzer anlegen
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">E-Mail</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Rolle</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Erstellt</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const isMe = user.id === currentUserId;
              const isInactive = user.status === "INACTIVE";
              return (
                <tr key={user.id} className={isInactive ? "bg-gray-50 opacity-70" : "hover:bg-gray-50"}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {user.displayName}
                    {isMe && <span className="ml-2 text-xs text-gray-400">(ich)</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ROLE_VARIANTS[user.systemRole] ?? "gray"}>
                      {ROLE_LABELS[user.systemRole] ?? user.systemRole}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={isInactive ? "red" : "green"}>
                      {isInactive ? "Inaktiv" : "Aktiv"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        title="Bearbeiten"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      {!isMe && (
                        isInactive ? (
                          <button
                            onClick={() => handleReactivate(user)}
                            disabled={loading === user.id}
                            className="rounded p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                            title="Reaktivieren"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmUser(user)}
                            disabled={loading === user.id}
                            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Deaktivieren"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirmUser}
        title="Benutzer deaktivieren"
        description={confirmUser ? `Möchtest du „${confirmUser.displayName}" wirklich deaktivieren? Der Benutzer kann sich danach nicht mehr einloggen.` : ""}
        confirmLabel="Deaktivieren"
        onConfirm={() => confirmUser && handleDeactivate(confirmUser)}
        onCancel={() => setConfirmUser(null)}
        danger
      />
    </>
  );
}
