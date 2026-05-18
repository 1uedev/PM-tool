"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, BarChart3, Columns3, GitBranch, Rocket, Network, Upload, Search } from "lucide-react";
import SearchButton from "@/components/search/SearchButton.jsx";

const TABS = [
  { label: "Explorer", href: (id) => `/projects/${id}`, icon: null },
  { label: "Starter", href: (id) => `/projects/${id}/starter`, icon: Rocket },
  { label: "Board", href: (id) => `/projects/${id}/board`, icon: Columns3 },
  { label: "Fortschritt", href: (id) => `/projects/${id}/progress`, icon: BarChart3 },
  { label: "Graph", href: (id) => `/projects/${id}/graph`, icon: Network },
  { label: "Traceability", href: (id) => `/projects/${id}/traceability`, icon: GitBranch },
];

export default function ProjectNavBar({ projectId, projectName, role }) {
  const pathname = usePathname();

  return (
    <header className="flex-shrink-0 border-b border-gray-200 bg-white">
      {/* Row 1: breadcrumb + utility actions */}
      <nav aria-label="Brotkrumennavigation">
        <div className="flex h-10 items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <Link href="/projects" className="flex-shrink-0 text-gray-500 hover:text-gray-900">
              Projekte
            </Link>
            <span className="flex-shrink-0 text-gray-300" aria-hidden="true">/</span>
            <span className="font-medium text-gray-900 max-w-[120px] sm:max-w-[240px] truncate">
              {projectName}
            </span>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            <SearchButton projectId={projectId} />
            {role !== "VIEWER" && (
              <Link
                href={`/projects/${projectId}/import`}
                title="Importieren"
                aria-label="Dokument importieren"
                className="flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Importieren</span>
              </Link>
            )}
            {role === "OWNER" && (
              <Link
                href={`/projects/${projectId}/settings`}
                title="Einstellungen"
                aria-label="Projekteinstellungen"
                className="flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Einstellungen</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Row 2: tab strip */}
      <nav aria-label="Projektnavigation">
        <div className="flex items-end overflow-x-auto px-2 sm:px-4">
          {TABS.map(({ label, href, icon: Icon }) => {
            const path = href(projectId);
            const isActive = pathname === path;
            return (
              <Link
                key={label}
                href={path}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-1.5 border-b-2 px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
