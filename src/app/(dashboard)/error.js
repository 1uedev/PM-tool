"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button.jsx";

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Etwas ist schiefgelaufen</h2>
        <p className="mt-1 text-sm text-gray-500">
          {error?.message ?? "Ein unerwarteter Fehler ist aufgetreten."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset} variant="secondary">Erneut versuchen</Button>
        <Button href="/projects">Zur Projektliste</Button>
      </div>
    </div>
  );
}
