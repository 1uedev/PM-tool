"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate as globalMutate } from "swr";
import { Bell } from "lucide-react";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data ?? { notifications: [], unreadCount: 0 });

const TYPE_LABELS = {
  COMMENT_ADDED: "kommentiert",
};

function formatRelative(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Gerade eben";
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`;
  return `vor ${Math.floor(diff / 86400)} T.`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const router = useRouter();

  const { data } = useSWR("/api/notifications", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  // Close panel when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications/read", { method: "PATCH" });
    globalMutate("/api/notifications");
  }

  async function handleNotificationClick(n) {
    // Mark this one as read
    if (!n.read) {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [n.id] }),
      });
      globalMutate("/api/notifications");
    }
    setOpen(false);
    if (n.projectId && n.artifactId) {
      router.push(`/projects/${n.projectId}?artifact=${n.artifactId}`);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Benachrichtigungen${unreadCount > 0 ? ` (${unreadCount} ungelesen)` : ""}`}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <span className="text-sm font-semibold text-gray-800">Benachrichtigungen</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Alle als gelesen
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-gray-400">
                Keine Benachrichtigungen
              </li>
            )}
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
                    )}
                    <div className={!n.read ? "" : "ml-4"}>
                      <p className="text-xs text-gray-800 leading-snug">
                        <span className="font-medium">
                          {n.actor?.name ?? n.actor?.email ?? "Jemand"}
                        </span>
                        {" "}hat{" "}
                        <span className="font-medium">{n.meta?.artifactTitle ?? "ein Artefakt"}</span>
                        {" "}{TYPE_LABELS[n.type] ?? "aktualisiert"}
                      </p>
                      {n.meta?.contentPreview && (
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                          {n.meta.contentPreview}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-gray-400">
                        {formatRelative(n.createdAt)}
                        {n.meta?.projectName && ` · ${n.meta.projectName}`}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
