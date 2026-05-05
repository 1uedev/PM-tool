"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { FileText, AlertCircle } from "lucide-react";
import { ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";
import ArtifactForm from "@/components/artifacts/ArtifactForm.jsx";
import ArtifactHeader from "@/components/artifacts/ArtifactHeader.jsx";
import RelationList from "@/components/artifacts/relations/RelationList.jsx";
import CommentList from "@/components/artifacts/comments/CommentList.jsx";
import VersionList from "@/components/artifacts/versions/VersionList.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import StarterContextPanel from "@/components/starter/StarterContextPanel.jsx";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data);

function EmptyHint() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center text-gray-400">
      <FileText className="h-12 w-12" />
      <div>
        <p className="text-sm font-medium text-gray-600">Kein Artefakt ausgewählt</p>
        <p className="mt-1 text-xs text-gray-400">
          Wähle ein Artefakt aus dem Baum oder klicke auf + um ein neues anzulegen.
        </p>
      </div>
    </div>
  );
}

function ArtifactDetailPanel({ artifactId, projectId }) {
  const { data: artifact, error, isLoading, mutate } = useSWR(
    `/api/projects/${projectId}/artifacts/${artifactId}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-6 w-6 text-blue-500" />
      </div>
    );
  }

  if (error || !artifact) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-red-600">Artefakt konnte nicht geladen werden</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <ArtifactHeader
        artifact={artifact}
        projectId={projectId}
        onStatusChange={(updated) => mutate(updated, false)}
      />
      <div className="mt-5 flex-1">
        <StarterContextPanel projectId={projectId} artifactType={artifact.type} />
        <ArtifactForm
          artifact={artifact}
          projectId={projectId}
          onSaved={(updated) => mutate(updated, false)}
        />
      </div>
      <RelationList projectId={projectId} artifactId={artifactId} artifactType={artifact.type} />
      <CommentList projectId={projectId} artifactId={artifactId} />
      <VersionList projectId={projectId} artifactId={artifactId} />
    </div>
  );
}

function NewArtifactPanel({ type, projectId }) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Neues {ARTIFACT_TYPE_LABELS[type] ?? type}
        </span>
      </div>
      <StarterContextPanel projectId={projectId} artifactType={type} />
      <ArtifactForm type={type} projectId={projectId} />
    </div>
  );
}

export default function ExplorerDetail({ projectId }) {
  const searchParams = useSearchParams();
  const artifactId = searchParams.get("artifact");
  const newType = searchParams.get("new");

  if (newType) return <NewArtifactPanel type={newType} projectId={projectId} />;
  if (artifactId) return <ArtifactDetailPanel artifactId={artifactId} projectId={projectId} />;
  return <EmptyHint />;
}
