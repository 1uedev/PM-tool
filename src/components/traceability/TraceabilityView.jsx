"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  ARTIFACT_GROUPS,
  ARTIFACT_GROUP_COLORS,
  ARTIFACT_TYPE_LABELS,
  RELATION_TYPE_LABELS,
} from "@/lib/constants.js";

const STATUS_DOT = {
  DONE: "bg-green-500",
  IN_REVIEW: "bg-yellow-400",
  DRAFT: "bg-gray-300",
};

function ConnectionBadge({ artifact, relationType, direction, projectId }) {
  const groupKey = ARTIFACT_GROUPS.find((g) => g.types.includes(artifact.type))?.key;
  const colorClass = groupKey ? (ARTIFACT_GROUP_COLORS[groupKey]?.badge ?? "") : "bg-gray-50 border-gray-200 text-gray-600";

  return (
    <Link
      href={`/projects/${projectId}?artifact=${artifact.id}`}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium hover:opacity-80 transition-opacity ${colorClass}`}
      title={`${RELATION_TYPE_LABELS[relationType] ?? relationType}${direction === "to" ? " (eingehend)" : ""}`}
    >
      {direction === "to" && <span className="opacity-60">←</span>}
      {ARTIFACT_TYPE_LABELS[artifact.type] ?? artifact.type}: {artifact.title}
      {direction === "from" && <span className="opacity-60">→</span>}
    </Link>
  );
}

function ArtifactRow({ artifact, connections, projectId }) {
  const hasConnections = connections.length > 0;

  return (
    <div className={`flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-white ${!hasConnections ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[artifact.status] ?? "bg-gray-300"}`} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/projects/${projectId}?artifact=${artifact.id}`}
            className="block text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
          >
            {artifact.title}
          </Link>
          {hasConnections ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {connections.map(({ artifact: connected, relationType, direction }, i) => (
                <ConnectionBadge
                  key={i}
                  artifact={connected}
                  relationType={relationType}
                  direction={direction}
                  projectId={projectId}
                />
              ))}
            </div>
          ) : (
            <p className="mt-0.5 text-xs text-gray-400 italic">keine Verknüpfungen</p>
          )}
        </div>
      </div>
    </div>
  );
}

function GroupSection({ group, artifacts, connectionMap, projectId, artifactById }) {
  const [collapsed, setCollapsed] = useState(false);
  const groupArtifacts = artifacts.filter((a) => group.types.includes(a.type));
  if (groupArtifacts.length === 0) return null;

  const connectedCount = groupArtifacts.filter((a) => (connectionMap[a.id]?.length ?? 0) > 0).length;
  const colorClass = ARTIFACT_GROUP_COLORS[group.key]?.header ?? "bg-gray-100 text-gray-800";

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-sm ${colorClass} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={`h-4 w-4 flex-shrink-0 transition-transform ${collapsed ? "" : "rotate-90"}`}
          />
          {group.label}
          <span className="font-normal opacity-70">
            {groupArtifacts.length} Artefakt{groupArtifacts.length !== 1 ? "e" : ""}
          </span>
        </div>
        <span className="font-normal text-xs opacity-70">
          {connectedCount}/{groupArtifacts.length} verbunden
        </span>
      </button>

      {!collapsed && (
        <div className="divide-y divide-gray-50 bg-gray-50 px-2 py-1">
          {groupArtifacts.map((artifact) => (
            <ArtifactRow
              key={artifact.id}
              artifact={artifact}
              connections={connectionMap[artifact.id] ?? []}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TraceabilityView({ artifacts, relations, projectId }) {
  // Build a fast lookup map
  const artifactById = Object.fromEntries(artifacts.map((a) => [a.id, a]));

  // Build connection map: artifactId → [{artifact, relationType, direction}]
  const connectionMap = {};
  for (const a of artifacts) connectionMap[a.id] = [];

  for (const rel of relations) {
    const source = artifactById[rel.sourceId];
    const target = artifactById[rel.targetId];
    if (!source || !target) continue;

    connectionMap[rel.sourceId].push({ artifact: target, relationType: rel.type, direction: "from" });
    connectionMap[rel.targetId].push({ artifact: source, relationType: rel.type, direction: "to" });
  }

  const totalArtifacts = artifacts.length;
  const connectedArtifacts = artifacts.filter((a) => (connectionMap[a.id]?.length ?? 0) > 0).length;
  const isolatedArtifacts = totalArtifacts - connectedArtifacts;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar */}
      <div className="flex gap-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{totalArtifacts}</p>
          <p className="text-xs text-gray-500">Artefakte gesamt</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{connectedArtifacts}</p>
          <p className="text-xs text-gray-500">verbunden</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-400">{isolatedArtifacts}</p>
          <p className="text-xs text-gray-500">isoliert</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{relations.length}</p>
          <p className="text-xs text-gray-500">Relationen</p>
        </div>
      </div>

      {totalArtifacts === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-16 text-center">
          <p className="text-sm font-medium text-gray-600">Noch keine Artefakte vorhanden</p>
          <p className="text-xs text-gray-400">Lege Artefakte im Explorer an und verknüpfe sie miteinander.</p>
        </div>
      ) : (
        /* Group sections */
        <div className="flex flex-col gap-3">
          {ARTIFACT_GROUPS.map((group) => (
            <GroupSection
              key={group.key}
              group={group}
              artifacts={artifacts}
              connectionMap={connectionMap}
              projectId={projectId}
              artifactById={artifactById}
            />
          ))}
        </div>
      )}
    </div>
  );
}
