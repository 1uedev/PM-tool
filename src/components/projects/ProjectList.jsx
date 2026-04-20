"use client";

import { FolderOpen } from "lucide-react";
import ProjectCard from "./ProjectCard.jsx";
import EmptyState from "@/components/layout/EmptyState.jsx";

export default function ProjectList({ projects }) {
  const active = projects.filter((p) => p.status !== "ARCHIVED");
  const archived = projects.filter((p) => p.status === "ARCHIVED");

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Noch keine Projekte"
        description="Lege dein erstes Projekt an und beginne mit der Strukturierung deiner PM-Artefakte."
        action={{ label: "Projekt anlegen", href: "/projects/new" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {active.length > 0 && (
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}

      {archived.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-500 uppercase tracking-wide">
            Archiviert
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
