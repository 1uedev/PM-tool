import Link from "next/link";
import { FileText, Users, Archive } from "lucide-react";
import Badge from "@/components/ui/Badge.jsx";

export default function ProjectCard({ project }) {
  const isArchived = project.status === "ARCHIVED";

  return (
    <Link
      href={`/projects/${project.id}`}
      className={`group flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
        isArchived ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 line-clamp-2">
          {project.name}
        </h3>
        {isArchived && (
          <Badge variant="gray">
            <Archive className="mr-1 h-3 w-3" />
            Archiviert
          </Badge>
        )}
      </div>

      {project.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
      )}

      <div className="mt-auto flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {project.artifactCount ?? 0} Artefakte
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {project.role}
        </span>
      </div>
    </Link>
  );
}
