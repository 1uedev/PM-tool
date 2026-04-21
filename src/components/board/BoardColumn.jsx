"use client";

import { useState } from "react";
import BoardCard from "./BoardCard.jsx";

export default function BoardColumn({ status, label, color, artifacts, onDrop, onCardClick }) {
  const [dragOver, setDragOver] = useState(false);

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const artifactId = e.dataTransfer.getData("text/plain");
    if (artifactId) onDrop?.(artifactId, status);
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border-2 p-4 transition-colors min-h-64
        ${dragOver ? "border-blue-400 bg-blue-50" : "border-transparent bg-gray-100"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</h3>
        <span className="ml-auto rounded-full bg-white px-1.5 py-0.5 text-xs font-medium text-gray-500 shadow-sm">
          {artifacts.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {artifacts.map((a) => (
          <div key={a.id} onClick={() => onCardClick?.(a.id)} className="cursor-pointer">
            <BoardCard artifact={a} />
          </div>
        ))}
        {artifacts.length === 0 && (
          <p className="py-4 text-center text-xs text-gray-400">Keine Artefakte</p>
        )}
      </div>
    </div>
  );
}
