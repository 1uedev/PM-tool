"use client";

import { useRef } from "react";
import { ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";

export default function BoardCard({ artifact, onDragStart }) {
  const dragRef = useRef(null);

  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", artifact.id);
    onDragStart?.(artifact);
  }

  return (
    <div
      ref={dragRef}
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing active:shadow-lg active:opacity-80 select-none"
    >
      <p className="text-sm font-medium text-gray-900 leading-snug">{artifact.title}</p>
      <p className="mt-1 text-xs text-gray-400">{ARTIFACT_TYPE_LABELS[artifact.type] ?? artifact.type}</p>
    </div>
  );
}
