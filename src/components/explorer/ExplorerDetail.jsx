"use client";

import { useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import { ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";

export default function ExplorerDetail({ projectId }) {
  const searchParams = useSearchParams();
  const artifactId = searchParams.get("artifact");
  const newType = searchParams.get("new");

  if (newType) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-400">
        <FileText className="h-10 w-10" />
        <p className="text-sm font-medium text-gray-600">
          Neue {ARTIFACT_TYPE_LABELS[newType]} anlegen
        </p>
        <p className="text-xs text-gray-400">
          Artefakt-Formular kommt in Schritt 7
        </p>
      </div>
    );
  }

  if (!artifactId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-400">
        <FileText className="h-10 w-10" />
        <p className="text-sm">Wähle ein Artefakt aus dem Baum aus</p>
        <p className="text-xs">oder lege über das + ein neues an</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-400">
      <FileText className="h-10 w-10" />
      <p className="text-sm text-gray-600 font-medium">Artefakt geladen</p>
      <p className="font-mono text-xs text-gray-400">{artifactId}</p>
      <p className="text-xs text-gray-400">Detail-Formular kommt in Schritt 7</p>
    </div>
  );
}
