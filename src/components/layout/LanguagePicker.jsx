"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LanguagePicker({ languages, currentLocale }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = languages.find((l) => l.code === currentLocale) ?? languages[0];

  async function handleSelect(code) {
    if (code === currentLocale || saving) return;
    setSaving(true);
    setOpen(false);
    try {
      await fetch("/api/users/me/language", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      router.refresh();
    } catch {
      // silent — language change is best-effort
    } finally {
      setSaving(false);
    }
  }

  if (!languages || languages.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={saving}
        title="Anzeigesprache ändern"
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
      >
        <Globe className="h-4 w-4 flex-shrink-0 text-gray-400" />
        <span className="flex-1 text-left">{current?.nativeName ?? currentLocale}</span>
        <ChevronUp className={`h-3 w-3 text-gray-400 transition-transform ${open ? "" : "rotate-180"}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <span className="flex-1 text-left">{lang.nativeName}</span>
              {lang.code === currentLocale && <Check className="h-3.5 w-3.5 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
