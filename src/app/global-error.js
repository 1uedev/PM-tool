"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="de">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Etwas ist schiefgelaufen</h2>
        <button
          onClick={reset}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Erneut versuchen
        </button>
      </body>
    </html>
  );
}
