"use client";

import { useState } from "react";
import { Database, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

const DB_TYPES = [
  { value: "sqlite",     label: "SQLite",      description: "Lokale Datei — ideal für Entwicklung" },
  { value: "postgresql", label: "PostgreSQL",   description: "Empfohlen für Produktion" },
  { value: "mariadb",    label: "MariaDB / MySQL", description: "Alternative für Produktion" },
];

const DEFAULT_PORTS = { postgresql: "5432", mariadb: "3306" };

function buildUrl(type, fields) {
  if (type === "sqlite") return `file:${fields.filePath || "./prisma/dev.db"}`;
  const { host, port, database, username, password } = fields;
  const protocol = type === "mariadb" ? "mysql" : "postgresql";
  const encodedPass = encodeURIComponent(password || "");
  return `${protocol}://${username || ""}:${encodedPass}@${host || "localhost"}:${port || DEFAULT_PORTS[type]}/${database || ""}`;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={handleCopy} className="rounded p-1 text-gray-400 hover:text-gray-700">
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function PostSaveInstructions({ type }) {
  const [open, setOpen] = useState(true);
  const schemaProvider = type === "mariadb" ? "mysql" : type;

  const steps = [
    {
      label: "1. Prisma-Schema anpassen",
      code: `// prisma/schema.prisma\ndatasource db {\n  provider = "${schemaProvider}"\n}`,
    },
    ...(type !== "sqlite" ? [{
      label: "2. Adapter installieren",
      code: type === "mariadb"
        ? "npm install @prisma/adapter-mysql mysql2"
        : "npm install @prisma/adapter-pg pg",
    }] : []),
    {
      label: type === "sqlite" ? "2. Datenbank initialisieren" : "3. Datenbank initialisieren",
      code: "npx prisma migrate deploy\n# oder für erstes Setup:\nnpx prisma db push",
    },
    {
      label: type === "sqlite" ? "3. Server neu starten" : "4. Server neu starten",
      code: "npm run build && npm start\n# oder in Entwicklung:\nnpm run dev",
    },
  ];

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-amber-800"
      >
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Nächste Schritte — Konfiguration manuell abschließen
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="border-t border-amber-200 px-4 pb-4 flex flex-col gap-4 text-sm">
          <p className="mt-3 text-amber-700">
            Die Datenbank-URL wurde in <code className="rounded bg-amber-100 px-1 font-mono text-xs">.env.local</code> gespeichert.
            Führe die folgenden Schritte aus, um die Umstellung abzuschließen:
          </p>
          {steps.map((step) => (
            <div key={step.label}>
              <p className="mb-1 font-medium text-amber-900">{step.label}</p>
              <div className="flex items-start gap-2 rounded-lg bg-gray-900 px-3 py-2">
                <pre className="flex-1 overflow-x-auto text-xs text-gray-100">{step.code}</pre>
                <CopyButton text={step.code} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DatabaseConfig({ initial }) {
  const [type, setType] = useState(initial.type ?? "sqlite");
  const [fields, setFields] = useState({
    filePath: initial.filePath ?? "./prisma/dev.db",
    host: initial.host ?? "localhost",
    port: initial.port ?? "",
    database: initial.database ?? "",
    username: initial.username ?? "",
    password: initial.password ?? "",
  });
  const [rawMode, setRawMode] = useState(false);
  const [rawUrl, setRawUrl] = useState("");
  const [testResult, setTestResult] = useState(null); // { ok, message }
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function field(key) {
    return (e) => {
      setFields((f) => ({ ...f, [key]: e.target.value }));
      setTestResult(null);
      setSaved(false);
    };
  }

  function handleTypeChange(newType) {
    setType(newType);
    setTestResult(null);
    setSaved(false);
    if (!fields.port) {
      setFields((f) => ({ ...f, port: DEFAULT_PORTS[newType] ?? "" }));
    }
  }

  function getUrl() {
    if (rawMode) return rawUrl;
    return buildUrl(type, fields);
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/database/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: getUrl() }),
      });
      const json = await res.json();
      setTestResult(json.data ?? { ok: false, message: json.error?.message ?? "Fehler" });
    } catch (e) {
      setTestResult({ ok: false, message: e.message });
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/database", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: getUrl() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Fehler");
      setSaved(true);
    } catch (e) {
      setTestResult({ ok: false, message: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* DB Type Selector */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-900">Datenbanktyp</h2>
        <div className="grid grid-cols-3 gap-3">
          {DB_TYPES.map((db) => (
            <button
              key={db.value}
              onClick={() => handleTypeChange(db.value)}
              className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors
                ${type === db.value
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
            >
              <span className="flex items-center gap-2 font-medium text-sm">
                <Database className={`h-4 w-4 ${type === db.value ? "text-blue-600" : "text-gray-400"}`} />
                {db.label}
              </span>
              <span className="text-xs text-gray-500">{db.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Connection Fields */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Verbindungseinstellungen</h2>
          {type !== "sqlite" && (
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={rawMode}
                onChange={(e) => { setRawMode(e.target.checked); setTestResult(null); setSaved(false); }}
                className="rounded border-gray-300"
              />
              Connection-URL direkt eingeben
            </label>
          )}
        </div>

        {type === "sqlite" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Dateipfad</label>
            <input
              type="text"
              value={fields.filePath}
              onChange={field("filePath")}
              placeholder="./prisma/dev.db"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">Relativ zum Projektstamm oder absoluter Pfad</p>
          </div>
        )}

        {type !== "sqlite" && rawMode && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Connection URL</label>
            <input
              type="text"
              value={rawUrl}
              onChange={(e) => { setRawUrl(e.target.value); setTestResult(null); setSaved(false); }}
              placeholder={type === "mariadb" ? "mysql://user:pass@host:3306/db" : "postgresql://user:pass@host:5432/db"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {type !== "sqlite" && !rawMode && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-700">Host</label>
                <input type="text" value={fields.host} onChange={field("host")} placeholder="localhost"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Port</label>
                <input type="text" value={fields.port} onChange={field("port")} placeholder={DEFAULT_PORTS[type]}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Datenbankname</label>
              <input type="text" value={fields.database} onChange={field("database")} placeholder="pmcopilot"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Benutzername</label>
              <input type="text" value={fields.username} onChange={field("username")} placeholder="postgres"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700">Passwort</label>
              <input type="password" value={fields.password} onChange={field("password")} placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
        )}

        {/* Generated URL preview */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Generierte DATABASE_URL</label>
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
            <code className="flex-1 text-xs text-gray-700 font-mono break-all">
              {getUrl().replace(/:([^:@/]+)@/, ":••••••••@")}
            </code>
            <CopyButton text={getUrl()} />
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <div className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm
            ${testResult.ok ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
            {testResult.ok
              ? <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
              : <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600" />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleTest}
            disabled={testing}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {testing ? "Verbindung wird getestet..." : "Verbindung testen"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Wird gespeichert..." : "Konfiguration speichern"}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              Gespeichert in .env.local
            </span>
          )}
        </div>
      </div>

      {/* Post-save instructions */}
      {saved && <PostSaveInstructions type={type} />}
    </div>
  );
}
