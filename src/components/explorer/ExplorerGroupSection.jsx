"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import ExplorerTreeGroup from "./ExplorerTreeGroup.jsx";

export default function ExplorerGroupSection({ group, byType, projectId }) {
  const [open, setOpen] = useState(true);

  // Count total artifacts in this group
  const total = group.types.reduce((sum, t) => sum + (byType[t]?.length ?? 0), 0);

  return (
    <div className="mb-1">
      {/* Group header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left hover:bg-gray-50"
      >
        <ChevronRight
          className={`h-3 w-3 flex-shrink-0 text-gray-300 transition-transform ${open ? "rotate-90" : ""}`}
        />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {group.label}
        </span>
        {total > 0 && (
          <span className="ml-auto text-[10px] text-gray-300">{total}</span>
        )}
      </button>

      {/* Type groups inside */}
      {open && (
        <div className="ml-1 flex flex-col gap-0.5">
          {group.types.map((type) => (
            <ExplorerTreeGroup
              key={type}
              type={type}
              artifacts={byType[type] ?? []}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
