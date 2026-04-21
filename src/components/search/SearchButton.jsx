"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import SearchDialog from "./SearchDialog.jsx";

export default function SearchButton({ projectId }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <Search className="h-4 w-4" />
        Suchen
        <kbd className="ml-1 hidden rounded bg-gray-100 px-1 text-xs text-gray-400 sm:inline">⌘K</kbd>
      </button>
      <SearchDialog projectId={projectId} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
