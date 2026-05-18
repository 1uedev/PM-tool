"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function ExplorerPanelLayout({ tree, detail }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasSelection = !!(searchParams.get("artifact") || searchParams.get("new"));

  function handleBack() {
    const params = new URLSearchParams(searchParams);
    params.delete("artifact");
    params.delete("new");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Tree — full-width on mobile; fixed 256 px on md+.
          Hidden on mobile when an artifact or new-form is selected. */}
      <aside
        className={`flex flex-col overflow-hidden border-r border-gray-200 bg-white
          w-full flex-shrink-0 md:w-64
          ${hasSelection ? "hidden md:flex" : "flex"}`}
        aria-label="Artefaktnavigation"
      >
        <div className="flex h-10 flex-shrink-0 items-center border-b border-gray-100 px-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Artefakte
          </span>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          {tree}
        </div>
      </aside>

      {/* Detail — hidden on mobile when nothing is selected */}
      <main
        className={`flex flex-1 flex-col overflow-hidden bg-gray-50
          ${!hasSelection ? "hidden md:flex" : "flex"}`}
      >
        {/* Back button — mobile only */}
        {hasSelection && (
          <div className="flex h-10 flex-shrink-0 items-center border-b border-gray-200 bg-white px-2 md:hidden">
            <button
              onClick={handleBack}
              aria-label="Zurück zur Artefaktliste"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Zurück
            </button>
          </div>
        )}
        {detail}
      </main>
    </div>
  );
}
