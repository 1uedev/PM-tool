"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useNodesState,
  useEdgesState,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
  ARTIFACT_GROUPS,
  ARTIFACT_TYPE_LABELS,
  RELATION_TYPE_LABELS,
} from "@/lib/constants.js";
import ArtifactNode from "./ArtifactNode.jsx";
import GraphRelationDialog from "./GraphRelationDialog.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { FileText } from "lucide-react";

// ── Layout constants ────────────────────────────────────────────────────────

const NODE_W = 192;
const NODE_H = 76;
const COL_GAP = 80;
const ROW_GAP = 20;

// ── Edge styling by relation type ───────────────────────────────────────────

const EDGE_COLORS = {
  DERIVES_FROM: "#3b82f6",  // blue
  DEPENDS_ON:   "#f97316",  // orange
  RELATES_TO:   "#9ca3af",  // gray
  VALIDATES:    "#22c55e",  // green
};

// Solid dot colors for MiniMap (matches ARTIFACT_GROUP_COLORS dot classes)
const GROUP_HEX = {
  foundations: "#64748b",
  research:    "#8b5cf6",
  audience:    "#ec4899",
  strategy:    "#3b82f6",
  discovery:   "#06b6d4",
  delivery:    "#22c55e",
  planning:    "#f97316",
  feedback:    "#f43f5e",
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function groupKeyOf(type) {
  return ARTIFACT_GROUPS.find((g) => g.types.includes(type))?.key ?? null;
}

/** Column layout: each occupied group gets its own column, artifacts stacked vertically. */
function computeLayout(artifacts) {
  const grouped = {};
  for (const a of artifacts) {
    const key = groupKeyOf(a.type) ?? "other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  }

  const positions = {};
  let colX = 20;

  for (const group of ARTIFACT_GROUPS) {
    const items = grouped[group.key];
    if (!items || items.length === 0) continue;
    let rowY = 20;
    for (const a of items) {
      positions[a.id] = { x: colX, y: rowY };
      rowY += NODE_H + ROW_GAP;
    }
    colX += NODE_W + COL_GAP;
  }

  return positions;
}

function toFlowNodes(artifacts, positions) {
  return artifacts.map((a) => ({
    id: a.id,
    type: "artifactNode",
    position: positions[a.id] ?? { x: 0, y: 0 },
    data: a,
  }));
}

function toFlowEdges(relations) {
  return relations.map((r) => {
    const color = EDGE_COLORS[r.type] ?? "#9ca3af";
    return {
      id: r.id,
      source: r.sourceId,
      target: r.targetId,
      label: RELATION_TYPE_LABELS[r.type] ?? r.type,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, color },
      style: { stroke: color, strokeWidth: 1.5 },
      labelStyle: { fontSize: 10, fill: color, fontWeight: 600 },
      labelBgStyle: { fill: "#ffffff", fillOpacity: 0.85 },
      labelBgPadding: [4, 3],
      animated: r.type === "DEPENDS_ON",
    };
  });
}

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data);
const nodeTypes = { artifactNode: ArtifactNode };

// ── Main component ───────────────────────────────────────────────────────────

export default function ArtifactGraph({ projectId }) {
  const router = useRouter();
  const { data, isLoading } = useSWR(`/api/projects/${projectId}/graph`, fetcher);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Pending drag-connect: { sourceId, targetId }
  const [pendingConnection, setPendingConnection] = useState(null);

  // Populate graph when data loads
  useEffect(() => {
    if (!data) return;
    const positions = computeLayout(data.artifacts);
    setNodes(toFlowNodes(data.artifacts, positions));
    setEdges(toFlowEdges(data.relations));
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Double-click node → open in Explorer
  const onNodeDoubleClick = useCallback(
    (event, node) => {
      router.push(`/projects/${projectId}?artifact=${node.id}`);
    },
    [projectId, router]
  );

  // Drag handle → handle: open relation dialog
  const onConnect = useCallback((params) => {
    if (params.source === params.target) return;
    setPendingConnection({ sourceId: params.source, targetId: params.target });
  }, []);

  // New relation confirmed in dialog → add edge without refetch
  function handleRelationCreated(relation) {
    setEdges((eds) => [...eds, ...toFlowEdges([relation])]);
    setPendingConnection(null);
  }

  const sourceArtifact = pendingConnection
    ? data?.artifacts.find((a) => a.id === pendingConnection.sourceId)
    : null;
  const targetArtifact = pendingConnection
    ? data?.artifacts.find((a) => a.id === pendingConnection.targetId)
    : null;

  // ── Loading / empty states ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-6 w-6 text-blue-500" />
      </div>
    );
  }

  if (!data?.artifacts?.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400">
        <FileText className="h-10 w-10" />
        <p className="text-sm">Noch keine Artefakte — erstelle das erste im Explorer.</p>
      </div>
    );
  }

  // ── Graph ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1" style={{ height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={onNodeDoubleClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.15}
        maxZoom={2}
        deleteKeyCode={null}        /* prevent accidental deletion with Delete key */
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e2e8f0" gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => GROUP_HEX[groupKeyOf(node.data?.type)] ?? "#94a3b8"}
          maskColor="rgba(248,250,252,0.7)"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        />

        {/* Legend + instructions */}
        <Panel position="top-right">
          <div className="w-52 rounded-lg border border-gray-200 bg-white/95 p-3 shadow-sm text-xs backdrop-blur-sm">
            <p className="mb-2 font-semibold text-gray-700">Verknüpfungstypen</p>
            <div className="space-y-1.5">
              {Object.entries(RELATION_TYPE_LABELS).map(([type, label]) => (
                <div key={type} className="flex items-center gap-2">
                  <span
                    className="h-0.5 w-5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: EDGE_COLORS[type] }}
                  />
                  <span className="text-gray-500">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-gray-100 pt-2.5 space-y-1 text-gray-400 leading-snug">
              <p><span className="font-medium text-gray-500">Verbinden:</span> rechten Handle ziehen zum linken Handle eines anderen Knotens</p>
              <p><span className="font-medium text-gray-500">Öffnen:</span> Doppelklick auf einen Knoten</p>
            </div>
          </div>
        </Panel>

        {/* Group color legend */}
        <Panel position="bottom-left">
          <div className="rounded-lg border border-gray-200 bg-white/95 p-3 shadow-sm text-xs backdrop-blur-sm">
            <p className="mb-2 font-semibold text-gray-700">Gruppen</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {ARTIFACT_GROUPS.map((g) => (
                <div key={g.key} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: GROUP_HEX[g.key] }}
                  />
                  <span className="text-gray-500">{g.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Relation dialog opened after a drag-connect */}
      {pendingConnection && sourceArtifact && targetArtifact && (
        <GraphRelationDialog
          projectId={projectId}
          sourceArtifact={sourceArtifact}
          targetArtifact={targetArtifact}
          onCreated={handleRelationCreated}
          onCancel={() => setPendingConnection(null)}
        />
      )}
    </div>
  );
}
