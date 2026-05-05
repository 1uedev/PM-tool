"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import ExplorerTreeGroup from "./ExplorerTreeGroup.jsx";
import { ARTIFACT_GROUP_COLORS } from "@/lib/constants.js";

export default function ExplorerGroupSection({ group, byType, projectId }) {
  const total = group.types.reduce((sum, t) => sum + (byType[t]?.length ?? 0), 0);
  // Start collapsed when the entire group has no artifacts
  const [open, setOpen] = useState(total > 0);
  const colors = ARTIFACT_GROUP_COLORS[group.key] ?? {};

  return (
    <div className="mb-1">
      {/* Group header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors hover:bg-gray-50`}
      >
        <ChevronRight
          className={`h-3 w-3 flex-shrink-0 transition-transform ${open ? "rotate-90" : ""} ${colors.text ?? "text-gray-300"}`}
        />
        <span className={`text-xs font-semibold uppercase tracking-wide ${colors.text ?? "text-gray-400"}`}>
          {group.label}
        </span>
        {total > 0 && (
          <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium ${colors.bg ?? ""} ${colors.text ?? "text-gray-400"}`}>
            {total}
          </span>
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
