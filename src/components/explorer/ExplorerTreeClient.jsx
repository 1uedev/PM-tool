"use client";

import useSWR from "swr";
import ExplorerTree from "./ExplorerTree.jsx";
import Spinner from "@/components/ui/Spinner.jsx";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data ?? []);

export default function ExplorerTreeClient({ projectId, initialArtifacts }) {
  const { data: artifacts } = useSWR(
    `/api/projects/${projectId}/artifacts`,
    fetcher,
    {
      fallbackData: initialArtifacts,
      revalidateOnFocus: false,
    }
  );

  return <ExplorerTree artifacts={artifacts ?? initialArtifacts} projectId={projectId} />;
}
