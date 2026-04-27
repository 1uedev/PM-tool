"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Rocket, ChevronDown, ChevronUp } from "lucide-react";
import { STARTER_ARTIFACT_CONTEXT, STARTER_QUESTIONS } from "@/lib/starterContext.js";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((j) => j.data);

export default function StarterContextPanel({ projectId, artifactType }) {
  const [open, setOpen] = useState(true);

  const relevantKeys = STARTER_ARTIFACT_CONTEXT[artifactType] ?? [];
  if (relevantKeys.length === 0) return null;

  const { data } = useSWR(`/api/projects/${projectId}/starter`, fetcher);
  const starter = data?.starter;

  // Only show if at least one relevant answer exists
  const relevantAnswers = relevantKeys
    .map((key) => ({ question: STARTER_QUESTIONS.find((q) => q.key === key), value: starter?.[key] }))
    .filter((item) => item.question && item.value?.trim());

  if (!starter) return null; // loading
  if (relevantAnswers.length === 0) {
    return (
      <div className="mb-5 rounded-lg border border-dashed border-blue-200 bg-blue-50/50 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-blue-500">
          <Rocket className="h-3.5 w-3.5" />
          <span>No PRD Starter answers for this artifact type yet.</span>
          <Link href={`/projects/${projectId}/starter`} className="underline hover:text-blue-700">
            Complete the starter →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <Rocket className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-semibold text-blue-700">PRD Starter context</span>
          <span className="text-xs text-blue-400">— keep your artifact consistent with these answers</span>
        </div>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-blue-400" />
          : <ChevronDown className="h-3.5 w-3.5 text-blue-400" />
        }
      </button>

      {open && (
        <div className="border-t border-blue-200 divide-y divide-blue-100">
          {relevantAnswers.map(({ question, value }) => (
            <div key={question.key} className="px-4 py-3">
              <p className="mb-1 text-xs font-semibold text-blue-600">
                Q{question.number} — {question.label}
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>
            </div>
          ))}
          <div className="px-4 py-2">
            <Link
              href={`/projects/${projectId}/starter`}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              Edit PRD Starter →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
