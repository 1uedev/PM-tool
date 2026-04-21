"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
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

// ── Connection badge with visible relation type label ──────────────────────
function ConnectionBadge({ artifact, relationType, direction, projectId }) {
  const groupKey = ARTIFACT_GROUPS.find((g) => g.types.includes(artifact.type))?.key;
  const colorClass = groupKey
    ? (ARTIFACT_GROUP_COLORS[groupKey]?.badge ?? "")
    : "bg-gray-50 border-gray-200 text-gray-600";

  const relationLabel = RELATION_TYPE_LABELS[relationType] ?? relationType;

  return (
    <Link
      href={`/projects/${projectId}?artifact=${artifact.id}`}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium hover:opacity-80 transition-opacity ${colorClass}`}
    >
      {direction === "to" && <span className="opacity-50 font-normal">←</span>}
      <span className="opacity-60 font-normal">{relationLabel}:</span>
      {ARTIFACT_TYPE_LABELS[artifact.type] ?? artifact.type}: {artifact.title}
      {direction === "from" && <span className="opacity-50 font-normal">→</span>}
    </Link>
  );
}

// ── Single artifact row ────────────────────────────────────────────────────
function ArtifactRow({ artifact, connections, projectId }) {
  const hasConnections = connections.length > 0;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-white
        ${!hasConnections ? "opacity-50" : ""}`}
    >
      <span
        className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[artifact.status] ?? "bg-gray-300"}`}
      />
      <div className="min-w-0 flex-1">
        <Link
          href={`/projects/${projectId}?artifact=${artifact.id}`}
          className="block text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
        >
          {artifact.title}
          <span className="ml-1.5 text-xs font-normal text-gray-400">
            ({ARTIFACT_TYPE_LABELS[artifact.type] ?? artifact.type})
          </span>
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
  );
}

// ── Group section ──────────────────────────────────────────────────────────
function GroupSection({ group, artifacts, connectionMap, projectId, forceOpen }) {
  const groupArtifacts = artifacts.filter((a) => group.types.includes(a.type));
  const [collapsed, setCollapsed] = useState(false);

  if (groupArtifacts.length === 0) return null;

  const connectedCount = groupArtifacts.filter(
    (a) => (connectionMap[a.id]?.length ?? 0) > 0
  ).length;
  const isolatedCount = groupArtifacts.length - connectedCount;
  const colorClass =
    ARTIFACT_GROUP_COLORS[group.key]?.header ?? "bg-gray-100 text-gray-800";

  const isOpen = forceOpen !== null ? forceOpen : !collapsed;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-sm ${colorClass} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
          />
          {group.label}
          <span className="font-normal opacity-70">
            {groupArtifacts.length} Artefakt{groupArtifacts.length !== 1 ? "e" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3 font-normal text-xs opacity-70">
          <span>{connectedCount}/{groupArtifacts.length} verbunden</span>
          {isolatedCount > 0 && (
            <span className="rounded-full bg-white/40 px-1.5 py-0.5">
              {isolatedCount} isoliert
            </span>
          )}
        </div>
      </button>

      {isOpen && (
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

// ── Filter bar ─────────────────────────────────────────────────────────────
const VISIBILITY_OPTIONS = [
  { value: "all", label: "Alle" },
  { value: "connected", label: "Nur verbunden" },
  { value: "isolated", label: "Nur isoliert" },
];

// ── Main view ──────────────────────────────────────────────────────────────
export default function TraceabilityView({ artifacts, relations, projectId }) {
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [allOpen, setAllOpen] = useState(null); // null = individual control, true/false = forced

  // Build connection map
  const artifactById = useMemo(
    () => Object.fromEntries(artifacts.map((a) => [a.id, a])),
    [artifacts]
  );

  const connectionMap = useMemo(() => {
    const map = {};
    for (const a of artifacts) map[a.id] = [];
    for (const rel of relations) {
      const source = artifactById[rel.sourceId];
      const target = artifactById[rel.targetId];
      if (!source || !target) continue;
      map[rel.sourceId].push({ artifact: target, relationType: rel.type, direction: "from" });
      map[rel.targetId].push({ artifact: source, relationType: rel.type, direction: "to" });
    }
    return map;
  }, [artifacts, relations, artifactById]);

  // Apply visibility filter
  const filteredArtifacts = useMemo(() => {
    if (visibilityFilter === "connected")
      return artifacts.filter((a) => (connectionMap[a.id]?.length ?? 0) > 0);
    if (visibilityFilter === "isolated")
      return artifacts.filter((a) => (connectionMap[a.id]?.length ?? 0) === 0);
    return artifacts;
  }, [artifacts, connectionMap, visibilityFilter]);

  // Stats (always from full set)
  const totalArtifacts = artifacts.length;
  const connectedArtifacts = artifacts.filter(
    (a) => (connectionMap[a.id]?.length ?? 0) > 0
  ).length;
  const isolatedArtifacts = totalArtifacts - connectedArtifacts;

  // Groups present in the current data for the group filter
  const presentGroups = ARTIFACT_GROUPS.filter((g) =>
    g.types.some((t) => artifacts.some((a) => a.type === t))
  );

  // Artifacts after group filter
  const displayArtifacts = useMemo(() => {
    if (groupFilter === "all") return filteredArtifacts;
    const group = ARTIFACT_GROUPS.find((g) => g.key === groupFilter);
    if (!group) return filteredArtifacts;
    return filteredArtifacts.filter((a) => group.types.includes(a.type));
  }, [filteredArtifacts, groupFilter]);

  function handleExpandAll() {
    setAllOpen(true);
    setTimeout(() => setAllOpen(null), 50);
  }
  function handleCollapseAll() {
    setAllOpen(false);
    setTimeout(() => setAllOpen(null), 50);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-6 rounded-xl border border-gray-200 bg-white p-4">
        <button
          onClick={() => setVisibilityFilter("all")}
          className={`text-center transition-opacity ${visibilityFilter !== "all" ? "opacity-50 hover:opacity-80" : ""}`}
        >
          <p className="text-2xl font-bold text-gray-900">{totalArtifacts}</p>
          <p className="text-xs text-gray-500">Artefakte gesamt</p>
        </button>
        <button
          onClick={() => setVisibilityFilter(visibilityFilter === "connected" ? "all" : "connected")}
          className={`text-center transition-opacity ${visibilityFilter === "isolated" ? "opacity-50 hover:opacity-80" : ""}`}
        >
          <p className="text-2xl font-bold text-green-600">{connectedArtifacts}</p>
          <p className="text-xs text-gray-500">verbunden</p>
        </button>
        <button
          onClick={() => setVisibilityFilter(visibilityFilter === "isolated" ? "all" : "isolated")}
          className={`text-center transition-opacity ${visibilityFilter === "connected" ? "opacity-50 hover:opacity-80" : ""}`}
        >
          <p className={`text-2xl font-bold ${isolatedArtifacts > 0 ? "text-orange-500" : "text-gray-400"}`}>
            {isolatedArtifacts}
          </p>
          <p className="text-xs text-gray-500">isoliert</p>
        </button>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{relations.length}</p>
          <p className="text-xs text-gray-500">Relationen</p>
        </div>
      </div>

      {totalArtifacts === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-16 text-center">
          <p className="text-sm font-medium text-gray-600">Noch keine Artefakte vorhanden</p>
          <p className="text-xs text-gray-400">
            Lege Artefakte im Explorer an und verknüpfe sie miteinander.
          </p>
        </div>
      ) : (
        <>
          {/* Filter toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Visibility filter pills */}
            <div className="flex gap-1">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVisibilityFilter(opt.value)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors
                    ${visibilityFilter === opt.value
                      ? "bg-gray-800 font-medium text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Group filter */}
            {presentGroups.length > 1 && (
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setGroupFilter("all")}
                  className={`rounded-full px-3 py-1 text-xs transition-colors
                    ${groupFilter === "all"
                      ? "bg-blue-100 font-medium text-blue-700"
                      : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  Alle Gruppen
                </button>
                {presentGroups.map((g) => {
                  const colors = ARTIFACT_GROUP_COLORS[g.key];
                  return (
                    <button
                      key={g.key}
                      onClick={() => setGroupFilter(groupFilter === g.key ? "all" : g.key)}
                      className={`rounded-full px-3 py-1 text-xs transition-colors
                        ${groupFilter === g.key
                          ? `${colors?.bg ?? "bg-gray-100"} font-medium ${colors?.text ?? "text-gray-700"}`
                          : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Expand / Collapse all */}
            <div className="ml-auto flex gap-1">
              <button
                onClick={handleExpandAll}
                title="Alle aufklappen"
                className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
              >
                <ChevronsUpDown className="h-3.5 w-3.5" />
                Alle auf
              </button>
              <button
                onClick={handleCollapseAll}
                title="Alle einklappen"
                className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
              >
                <ChevronsDownUp className="h-3.5 w-3.5" />
                Alle zu
              </button>
            </div>
          </div>

          {/* Group sections */}
          <div className="flex flex-col gap-3">
            {ARTIFACT_GROUPS.map((group) => (
              <GroupSection
                key={group.key}
                group={group}
                artifacts={displayArtifacts}
                connectionMap={connectionMap}
                projectId={projectId}
                forceOpen={allOpen}
              />
            ))}
          </div>

          {displayArtifacts.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white py-10 text-center text-sm text-gray-400">
              Keine Artefakte entsprechen dem gewählten Filter.
            </div>
          )}
        </>
      )}
    </div>
  );
}
