"use client";

import useSWR from "swr";
import { MessageSquare } from "lucide-react";
import Spinner from "@/components/ui/Spinner.jsx";
import CommentForm from "./CommentForm.jsx";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data);

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CommentItem({ comment }) {
  const initials = (comment.author.name ?? comment.author.email)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-800">
            {comment.author.name ?? comment.author.email}
          </span>
          <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

export default function CommentList({ projectId, artifactId }) {
  const commentsKey = `/api/projects/${projectId}/artifacts/${artifactId}/comments`;
  const { data: comments, isLoading, mutate } = useSWR(commentsKey, fetcher);

  function handleAdded(newComment) {
    mutate((prev) => [...(prev ?? []), newComment], false);
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-5">
      <div className="mb-3 flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Kommentare</span>
        {!isLoading && (
          <span className="text-xs text-gray-400">({(comments ?? []).length})</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
          <Spinner className="h-4 w-4" /> Lade Kommentare…
        </div>
      ) : (comments ?? []).length === 0 ? (
        <p className="text-sm text-gray-400 italic px-1">Noch keine Kommentare</p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      )}

      <CommentForm
        projectId={projectId}
        artifactId={artifactId}
        onAdded={handleAdded}
      />
    </div>
  );
}
