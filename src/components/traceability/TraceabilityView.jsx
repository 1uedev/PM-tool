"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, ChevronsDownUp, ChevronsUpDown, Plus } from "lucide-react";
import {
  ARTIFACT_GROUPS,
  ARTIFACT_GROUP_COLORS,
  ARTIFACT_TYPE_LABELS,
  ARTIFACT_STATUS_LABELS,
  RELATION_TYPE,
  RELATION_TYPE_LABELS,
} from "@/lib/constants.js";

const STATUS_DOT = {
  DONE: "bg-green-500",
  IN_REVIEW: "bg-yellow-400",
  DRAFT: "bg-gray-300",
};

const STATUS_COLORS = {
  DRAFT: "bg-white border-gray-200 text-gray-600",
  IN_REVIEW: "bg-yellow-50 border-yellow-200 text-yellow-800",
  DONE: "bg-green-50 border-green-200 text-green-800",
};

// ── Connection badge ────────────────────────────────────────────────────────
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
function ArtifactRow({ artifact, connections, projectId, relationTypeFilter }) {
  const filteredConnections = useMemo(() => {
    if (relationTypeFilter === "all") return connections;
    return connections.filter((c) => c.relationType === relationTypeFilter);
  }, [connections, relationTypeFilter]);

  const hasFiltered = filteredConnections.length > 0;
  const hasAny = connections.length > 0;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-white
        ${!hasAny ? "opacity-40" : ""}`}
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
        {hasFiltered ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {filteredConnections.map(({ artifact: connected, relationType, direction }) => (
              <ConnectionBadge
                key={`${direction}-${connected.id}-${relationType}`}
                artifact={connected}
                relationType={relationType}
                direction={direction}
                projectId={projectId}
              />
            ))}
          </div>
        ) : (
          <p className="mt-0.5 text-xs text-gray-400 italic">
            {hasAny && relationTypeFilter !== "all"
              ? `keine „${RELATION_TYPE_LABELS[relationTypeFilter]}"-Verknüpfungen`
              : "keine Verknüpfungen"}
          </p>
        )}
      </div>
      <span
        className={`flex-shrink-0 rounded-full border px-1.5 py-0.5 text-xs ${STATUS_COLORS[artifact.status] ?? "bg-white border-gray-200 text-gray-500"}`}
      >
        {ARTIFACT_STATUS_LABELS[artifact.status] ?? artifact.status}
      </span>
    </div>
  );
}

// ── Coverage bar ───────────────────────────────────────────────────────────
function CoverageBar({ typesInGroup, presentTypes, colorKey }) {
  const pct = typesInGroup === 0 ? 0 : Math.round((presentTypes / typesInGroup) * 100);
  const barColor =
    pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-blue-400" : "bg-orange-400";

  return (
    <div className="flex items-center gap-1.5">
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Abdeckung: ${pct}%`}
        className="h-1 w-16 overflow-hidden rounded-full bg-white/40"
      >
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs opacity-70">{pct}% abgedeckt</span>
    </div>
  );
}

// ── Missing types list ─────────────────────────────────────────────────────
function MissingTypes({ missingTypes, projectId }) {
  const [open, setOpen] = useState(false);
  if (missingTypes.length === 0) return null;

  return (
    <div className="border-t border-dashed border-gray-200 bg-white/60 px-4 py-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ChevronRight className={`h-3 w-3 transition-transform ${open ? "rotate-90" : ""}`} />
        {missingTypes.length} fehlende{missingTypes.length !== 1 ? " Typen" : "r Typ"}
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {missingTypes.map((type) => (
            <Link
              key={type}
              href={`/projects/${projectId}?newType=${type}`}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 bg-white px-2.5 py-0.5 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
            >
              <Plus className="h-3 w-3" />
              {ARTIFACT_TYPE_LABELS[type] ?? type}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Group section ──────────────────────────────────────────────────────────
function GroupSection({ group, artifacts, connectionMap, projectId, forceOpen, relationTypeFilter }) {
  const groupArtifacts = artifacts.filter((a) => group.types.includes(a.type));
  const [collapsed, setCollapsed] = useState(false);

  // Types coverage
  const presentTypeSet = new Set(groupArtifacts.map((a) => a.type));
  const missingTypes = group.types.filter((t) => !presentTypeSet.has(t));

  if (groupArtifacts.length === 0 && missingTypes.length === group.types.length) {
    // Group not represented at all — show collapsed placeholder
    return (
      <div className="rounded-xl border border-dashed border-gray-200 overflow-hidden">
        <div
          className={`flex items-center justify-between px-4 py-2.5 text-sm opacity-50 ${ARTIFACT_GROUP_COLORS[group.key]?.header ?? "bg-gray-100 text-gray-800"}`}
        >
          <span className="font-semibold">{group.label}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-normal">0 Artefakte</span>
            <Link
              href={`/projects/${projectId}?newType=${group.types[0]}`}
              className="rounded-full bg-white/30 px-2 py-0.5 text-xs hover:bg-white/60 transition-colors"
            >
              + Erstes anlegen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const connectedCount = groupArtifacts.filter(
    (a) => (connectionMap[a.id]?.length ?? 0) > 0
  ).length;
  const isolatedCount = groupArtifacts.length - connectedCount;
  const colorClass = ARTIFACT_GROUP_COLORS[group.key]?.header ?? "bg-gray-100 text-gray-800";
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
          <CoverageBar
            typesInGroup={group.types.length}
            presentTypes={presentTypeSet.size}
            colorKey={group.key}
          />
          <span>{connectedCount}/{groupArtifacts.length} verknüpft</span>
          {isolatedCount > 0 && (
            <span className="rounded-full bg-white/40 px-1.5 py-0.5">
              {isolatedCount} isoliert
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div className="divide-y divide-gray-50 bg-gray-50 px-2 py-1">
            {groupArtifacts.map((artifact) => (
              <ArtifactRow
                key={artifact.id}
                artifact={artifact}
                connections={connectionMap[artifact.id] ?? []}
                projectId={projectId}
                relationTypeFilter={relationTypeFilter}
              />
            ))}
          </div>
          <MissingTypes missingTypes={missingTypes} projectId={projectId} />
        </>
      )}
    </div>
  );
}

// ── Pill button ────────────────────────────────────────────────────────────
function Pill({ active, onClick, children, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs transition-colors
        ${active
          ? activeClass ?? "bg-gray-800 font-medium text-white"
          : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
        }`}
    >
      {children}
    </button>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────
export default function TraceabilityView({ artifacts, relations, projectId }) {
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [relationTypeFilter, setRelationTypeFilter] = useState("all");
  const [allOpen, setAllOpen] = useState(null);

  // Artifact lookup
  const artifactById = useMemo(
    () => Object.fromEntries(artifacts.map((a) => [a.id, a])),
    [artifacts]
  );

  // Build connection map (bidirectional)
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

  // Apply filters
  const filteredArtifacts = useMemo(() => {
    let list = artifacts;
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (visibilityFilter === "connected")
      list = list.filter((a) => (connectionMap[a.id]?.length ?? 0) > 0);
    if (visibilityFilter === "isolated")
      list = list.filter((a) => (connectionMap[a.id]?.length ?? 0) === 0);
    if (groupFilter !== "all") {
      const group = ARTIFACT_GROUPS.find((g) => g.key === groupFilter);
      if (group) list = list.filter((a) => group.types.includes(a.type));
    }
    return list;
  }, [artifacts, connectionMap, visibilityFilter, statusFilter, groupFilter]);

  // Global stats (always from full set)
  const totalArtifacts = artifacts.length;
  const connectedArtifacts = artifacts.filter((a) => (connectionMap[a.id]?.length ?? 0) > 0).length;
  const isolatedArtifacts = totalArtifacts - connectedArtifacts;

  // Type coverage across the whole domain model
  const totalTypes = ARTIFACT_GROUPS.reduce((sum, g) => sum + g.types.length, 0);
  const presentTypes = new Set(artifacts.map((a) => a.type)).size;
  const coveragePct = totalTypes === 0 ? 0 : Math.round((presentTypes / totalTypes) * 100);

  // Relation type breakdown for filter labels
  const relationTypeCounts = useMemo(() => {
    const counts = {};
    for (const rel of relations) counts[rel.type] = (counts[rel.type] ?? 0) + 1;
    return counts;
  }, [relations]);

  const presentGroups = ARTIFACT_GROUPS.filter((g) =>
    g.types.some((t) => artifacts.some((a) => a.type === t))
  );

  function handleExpandAll() { setAllOpen(true); setTimeout(() => setAllOpen(null), 50); }
  function handleCollapseAll() { setAllOpen(false); setTimeout(() => setAllOpen(null), 50); }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-6 rounded-xl border border-gray-200 bg-white p-4">
        <button
          onClick={() => setVisibilityFilter("all")}
          className={`text-center transition-opacity ${visibilityFilter !== "all" ? "opacity-50 hover:opacity-80" : ""}`}
        >
          <p className="text-2xl font-bold text-gray-900">{totalArtifacts}</p>
          <p className="text-xs text-gray-500">Artefakte</p>
        </button>
        <button
          onClick={() => setVisibilityFilter(visibilityFilter === "connected" ? "all" : "connected")}
          className={`text-center transition-opacity ${visibilityFilter === "isolated" ? "opacity-50 hover:opacity-80" : ""}`}
        >
          <p className="text-2xl font-bold text-green-600">{connectedArtifacts}</p>
          <p className="text-xs text-gray-500">verknüpft</p>
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
          <p className="text-xs text-gray-500">Verknüpfungen</p>
        </div>
        {/* Domain coverage */}
        <div className="ml-auto flex flex-col items-end justify-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Domänenabdeckung</span>
            <span className={`text-sm font-bold ${coveragePct === 100 ? "text-green-600" : coveragePct >= 50 ? "text-blue-600" : "text-orange-500"}`}>
              {coveragePct}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={coveragePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Domänenabdeckung: ${coveragePct}%`}
            className="h-1.5 w-40 overflow-hidden rounded-full bg-gray-100"
          >
            <div
              className={`h-full rounded-full transition-all ${coveragePct === 100 ? "bg-green-500" : coveragePct >= 50 ? "bg-blue-400" : "bg-orange-400"}`}
              style={{ width: `${coveragePct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">{presentTypes} von {totalTypes} Typen genutzt</p>
        </div>
      </div>

      {totalArtifacts === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-16 text-center">
          <p className="text-sm font-medium text-gray-600">Noch keine Artefakte</p>
          <p className="text-xs text-gray-400">
            Erstelle Artefakte im Explorer und verknüpfe sie miteinander.
          </p>
        </div>
      ) : (
        <>
          {/* Filter toolbar */}
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex flex-col gap-2">
              {/* Visibility filter */}
              <div className="flex gap-1">
                {[
                  { value: "all", label: "Alle" },
                  { value: "connected", label: "Verknüpft" },
                  { value: "isolated", label: "Isoliert" },
                ].map((opt) => (
                  <Pill
                    key={opt.value}
                    active={visibilityFilter === opt.value}
                    onClick={() => setVisibilityFilter(opt.value)}
                  >
                    {opt.label}
                  </Pill>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex gap-1">
                <Pill active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                  Alle Status
                </Pill>
                {Object.entries(ARTIFACT_STATUS_LABELS).map(([key, label]) => (
                  <Pill
                    key={key}
                    active={statusFilter === key}
                    onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
                    activeClass={
                      key === "DONE"
                        ? "bg-green-600 font-medium text-white"
                        : key === "IN_REVIEW"
                        ? "bg-yellow-500 font-medium text-white"
                        : "bg-gray-800 font-medium text-white"
                    }
                  >
                    {label}
                  </Pill>
                ))}
              </div>

              {/* Relation type filter */}
              <div className="flex flex-wrap gap-1">
                <Pill
                  active={relationTypeFilter === "all"}
                  onClick={() => setRelationTypeFilter("all")}
                  activeClass="bg-blue-600 font-medium text-white"
                >
                  Alle Verknüpfungen
                </Pill>
                {Object.entries(RELATION_TYPE).map(([key]) => {
                  const count = relationTypeCounts[key] ?? 0;
                  if (count === 0) return null;
                  return (
                    <Pill
                      key={key}
                      active={relationTypeFilter === key}
                      onClick={() => setRelationTypeFilter(relationTypeFilter === key ? "all" : key)}
                      activeClass="bg-blue-600 font-medium text-white"
                    >
                      {RELATION_TYPE_LABELS[key]}
                      <span className="ml-1 opacity-60">({count})</span>
                    </Pill>
                  );
                })}
              </div>
            </div>

            {/* Group filter + expand/collapse */}
            <div className="flex flex-col gap-2 ml-auto items-end">
              {presentGroups.length > 1 && (
                <div className="flex gap-1 flex-wrap justify-end">
                  <Pill
                    active={groupFilter === "all"}
                    onClick={() => setGroupFilter("all")}
                    activeClass="bg-gray-600 font-medium text-white"
                  >
                    Alle Gruppen
                  </Pill>
                  {presentGroups.map((g) => {
                    const colors = ARTIFACT_GROUP_COLORS[g.key];
                    return (
                      <Pill
                        key={g.key}
                        active={groupFilter === g.key}
                        onClick={() => setGroupFilter(groupFilter === g.key ? "all" : g.key)}
                        activeClass={`${colors?.bg ?? "bg-gray-100"} font-medium ${colors?.text ?? "text-gray-700"}`}
                      >
                        {g.label}
                      </Pill>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-1">
                <button
                  onClick={handleExpandAll}
                  className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
                >
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                  Alle aufklappen
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
                >
                  <ChevronsDownUp className="h-3.5 w-3.5" />
                  Alle zuklappen
                </button>
              </div>
            </div>
          </div>

          {/* Group sections — always show all groups for gap detection */}
          <div className="flex flex-col gap-3">
            {ARTIFACT_GROUPS.map((group) => {
              // When group filter is active, skip other groups
              if (groupFilter !== "all" && group.key !== groupFilter) return null;
              return (
                <GroupSection
                  key={group.key}
                  group={group}
                  artifacts={filteredArtifacts}
                  connectionMap={connectionMap}
                  projectId={projectId}
                  forceOpen={allOpen}
                  relationTypeFilter={relationTypeFilter}
                />
              );
            })}
          </div>

          {filteredArtifacts.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white py-10 text-center text-sm text-gray-400">
              Keine Artefakte entsprechen den gewählten Filtern.
            </div>
          )}
        </>
      )}
    </div>
  );
}
