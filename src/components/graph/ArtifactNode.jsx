"use client";

import { Handle, Position } from "@xyflow/react";
import { ARTIFACT_TYPE_LABELS, ARTIFACT_GROUPS, ARTIFACT_GROUP_COLORS } from "@/lib/constants.js";

const STATUS_DOT = {
  DONE: "bg-green-500",
  IN_REVIEW: "bg-yellow-400",
  DRAFT: "bg-gray-300",
};

const STATUS_LABEL = {
  DONE: "Fertig",
  IN_REVIEW: "In Prüfung",
  DRAFT: "Entwurf",
};

export default function ArtifactNode({ data, selected }) {
  const groupKey = ARTIFACT_GROUPS.find((g) => g.types.includes(data.type))?.key;
  const colors = groupKey ? ARTIFACT_GROUP_COLORS[groupKey] : null;

  return (
    <div
      className={`w-48 rounded-lg border-2 bg-white shadow-sm transition-all
        ${selected ? "border-blue-500 shadow-md ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300 hover:shadow"}`}
    >
      {/* Group-colored type header */}
      <div className={`rounded-t px-2.5 py-1 ${colors?.header ?? "bg-gray-100 text-gray-700"}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
          {ARTIFACT_TYPE_LABELS[data.type] ?? data.type}
        </span>
      </div>

      {/* Content */}
      <div className="px-2.5 py-2">
        <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2rem]">
          {data.title}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${STATUS_DOT[data.status] ?? "bg-gray-300"}`} />
          <span className="text-[10px] text-gray-400">{STATUS_LABEL[data.status] ?? data.status}</span>
        </div>
      </div>

      {/* Connection handles — left = target, right = source */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 10, height: 10, background: "#94a3b8", border: "2px solid #fff" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 10, height: 10, background: "#94a3b8", border: "2px solid #fff" }}
      />
    </div>
  );
}
