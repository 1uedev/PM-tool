import Link from "next/link";
import { FileSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <FileSearch className="h-6 w-6 text-gray-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Seite nicht gefunden</h2>
        <p className="mt-1 text-sm text-gray-500">
          Diese Ressource existiert nicht oder du hast keinen Zugriff darauf.
        </p>
      </div>
      <Link
        href="/projects"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Zur Projektliste
      </Link>
    </div>
  );
}
