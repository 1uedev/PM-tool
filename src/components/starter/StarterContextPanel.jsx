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

  // Always call hooks before any conditional return (Rules of Hooks)
  const { data } = useSWR(
    relevantKeys.length > 0 ? `/api/projects/${projectId}/starter` : null,
    fetcher
  );

  if (relevantKeys.length === 0) return null;

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
          <span>Noch keine PRD-Starter-Antworten für diesen Artefakttyp.</span>
          <Link href={`/projects/${projectId}/starter`} className="underline hover:text-blue-700">
            Starter ausfüllen →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-blue-100/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Rocket className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-semibold text-blue-700">PRD-Starter-Kontext</span>
          <span className="text-xs text-blue-400 hidden sm:inline">— Artefakt konsistent mit diesen Antworten halten</span>
        </div>
        <div className="flex items-center gap-1 text-blue-400">
          <span className="text-xs">{open ? "Einklappen" : "Aufklappen"}</span>
          {open
            ? <ChevronUp className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />
          }
        </div>
      </button>

      <div className={`transition-all duration-200 ease-in-out ${open ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
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
              PRD Starter bearbeiten →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
