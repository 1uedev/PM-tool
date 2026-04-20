"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ARTIFACT_STATUS_LABELS } from "@/lib/constants.js";

const STATUS_DOT = {
  DONE: "bg-green-500",
  IN_REVIEW: "bg-yellow-400",
  DRAFT: "bg-gray-300",
};

export default function ExplorerTreeItem({ artifact, projectId }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("artifact");
  const isSelected = selectedId === artifact.id;

  function handleClick() {
    const params = new URLSearchParams(searchParams);
    params.set("artifact", artifact.id);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <button
      onClick={handleClick}
      title={ARTIFACT_STATUS_LABELS[artifact.status]}
      className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors
        ${isSelected
          ? "bg-blue-50 text-blue-800 font-medium"
          : "text-gray-700 hover:bg-gray-100"
        }`}
    >
      <span
        className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[artifact.status] ?? "bg-gray-300"}`}
      />
      <span className="truncate">{artifact.title}</span>
    </button>
  );
}
