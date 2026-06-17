"use client";

import { useState } from "react";
import { Sparkles, CheckCircle, XCircle, Eye, EyeOff, ChevronDown, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { OLLAMA_DEFAULT_BASE_URL } from "@/lib/constants.js";

const PROVIDERS = [
  {
    value: "claude",
    label: "Anthropic Claude",
    logo: "🟠",
    description: "Leistungsstarke KI von Anthropic",
    kind: "cloud",
    keyPlaceholder: "sk-ant-api03-...",
    keyHint: "API-Key aus console.anthropic.com",
    models: [
      { value: "claude-opus-4-7",           label: "Claude Opus 4.7",   badge: "Leistungsstark" },
      { value: "claude-sonnet-4-6",         label: "Claude Sonnet 4.6", badge: "Empfohlen" },
      { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5",  badge: "Schnell" },
    ],
  },
  {
    value: "openai",
    label: "OpenAI",
    logo: "🟢",
    description: "GPT-Modelle von OpenAI",
    kind: "cloud",
    keyPlaceholder: "sk-proj-...",
    keyHint: "API-Key aus platform.openai.com",
    models: [
      { value: "gpt-5.5",      label: "GPT-5.5",      badge: "Leistungsstark" },
      { value: "gpt-5.4",      label: "GPT-5.4",      badge: "Empfohlen" },
      { value: "gpt-5.4-mini", label: "GPT-5.4 mini", badge: "Schnell" },
    ],
  },
  {
    value: "ollama",
    label: "Ollama (lokal)",
    logo: "🦙",
    description: "Lokale Modelle, kein API-Key",
    kind: "local",
    models: [],
  },
  {
    value: "disabled",
    label: "Deaktiviert",
    logo: "⭕",
    description: "KI-Features sind ausgeschaltet",
    kind: "off",
    models: [],
  },
];

const BADGE_COLORS = {
  "Empfohlen":      "bg-blue-50 text-blue-700 border-blue-200",
  "Leistungsstark": "bg-purple-50 text-purple-700 border-purple-200",
  "Schnell":        "bg-green-50 text-green-700 border-green-200",
};

function formatSize(bytes) {
  if (!bytes) return "";
  const gb = bytes / 1e9;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  return `${(bytes / 1e6).toFixed(0)} MB`;
}

// Parse a response body defensively — a bodyless 500 (e.g. server crash)
// must not surface as a cryptic "Unexpected end of JSON input".
async function readJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export default function AiProviderConfig({ initial }) {
  const [provider, setProvider] = useState(initial.provider ?? "disabled");
  const [model, setModel] = useState(initial.model ?? "");
  const [apiKey, setApiKey] = useState("");          // never pre-filled from server
  const [showKey, setShowKey] = useState(false);
  const [baseUrl, setBaseUrl] = useState(initial.baseUrl ?? "");
  const [timeoutMs, setTimeoutMs] = useState(initial.timeoutMs ?? 30000);
  const [maxTokens, setMaxTokens] = useState(initial.maxTokens ?? 2048);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(initial.apiKeySet ?? false);

  const [ollamaModels, setOllamaModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelLoadError, setModelLoadError] = useState("");

  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const selectedProvider = PROVIDERS.find((p) => p.value === provider);
  const isCloud = selectedProvider?.kind === "cloud";
  const isLocal = selectedProvider?.kind === "local";

  function handleProviderChange(val) {
    setProvider(val);
    setModel(""); // reset model when provider changes
    setTestResult(null);
    setModelLoadError("");
    setSaved(false);
  }

  function handleModelChange(val) {
    setModel(val);
    setTestResult(null);
    setSaved(false);
  }

  // Effective model: selected, else first cloud model (Ollama has no preset list)
  const effectiveModel = model || (isCloud ? selectedProvider?.models[0]?.value : "") || "";
  const effectiveBaseUrl = baseUrl || OLLAMA_DEFAULT_BASE_URL;

  async function loadOllamaModels() {
    setLoadingModels(true);
    setModelLoadError("");
    try {
      const res = await fetch("/api/admin/ai/ollama-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl: baseUrl || undefined }),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error?.message ?? `Anfrage fehlgeschlagen (HTTP ${res.status})`);
      const models = json.data.models ?? [];
      setOllamaModels(models);
      if (models.length === 0) {
        setModelLoadError("Keine Modelle installiert — z. B. „ollama pull llama3.2“.");
      } else if (!models.some((m) => m.name === model)) {
        setModel(models[0].name);
      }
    } catch (e) {
      setOllamaModels([]);
      setModelLoadError(e.message);
    } finally {
      setLoadingModels(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    setError("");
    try {
      const res = await fetch("/api/admin/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model: effectiveModel,
          apiKey: apiKey || undefined,
          baseUrl: isLocal ? effectiveBaseUrl : undefined,
        }),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error?.message ?? `Anfrage fehlgeschlagen (HTTP ${res.status})`);
      setTestResult(json.data);
    } catch (e) {
      setTestResult({ ok: false, message: e.message });
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const body = {
        provider,
        model: effectiveModel,
        timeoutMs,
        maxTokens,
      };
      if (isLocal) body.baseUrl = effectiveBaseUrl;
      if (apiKey && !isLocal) body.apiKey = apiKey;

      const res = await fetch("/api/admin/ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error?.message ?? `Anfrage fehlgeschlagen (HTTP ${res.status})`);
      setSaved(true);
      if (json.data.apiKeySet) {
        setApiKeySet(true);
        setApiKey(""); // clear input after save
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Test is allowed without a key for local providers
  const testDisabled = testing || (isCloud && !apiKey && !apiKeySet);

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Provider selection */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-900">KI-Provider</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              onClick={() => handleProviderChange(p.value)}
              className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors
                ${provider === p.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
            >
              <span className="text-lg">{p.logo}</span>
              <span className={`text-sm font-medium ${provider === p.value ? "text-blue-900" : "text-gray-800"}`}>
                {p.label}
              </span>
              <span className="text-xs text-gray-500">{p.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cloud config: model radios + API key */}
      {isCloud && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-900">Modell & API-Key</h2>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Modell</label>
            <div className="flex flex-col gap-2">
              {selectedProvider.models.map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors
                    ${effectiveModel === m.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={m.value}
                    checked={effectiveModel === m.value}
                    onChange={() => handleModelChange(m.value)}
                    className="text-blue-600"
                  />
                  <span className="flex-1 text-sm font-medium text-gray-900">{m.label}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${BADGE_COLORS[m.badge] ?? ""}`}>
                    {m.badge}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center justify-between text-xs font-medium text-gray-700">
              <span>API-Key</span>
              {apiKeySet && !apiKey && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Key hinterlegt
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setTestResult(null); setSaved(false); }}
                placeholder={apiKeySet ? "••••••••  (leer lassen = bestehenden Key behalten)" : selectedProvider?.keyPlaceholder ?? ""}
                className="w-full rounded-lg border border-gray-300 pr-10 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {selectedProvider?.keyHint && (
              <p className="mt-1 text-xs text-gray-400">{selectedProvider.keyHint}</p>
            )}
          </div>
        </div>
      )}

      {/* Local (Ollama) config: server URL + live model list */}
      {isLocal && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-900">Ollama-Server & Modell</h2>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Server-Adresse</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => { setBaseUrl(e.target.value); setTestResult(null); setSaved(false); }}
                placeholder={OLLAMA_DEFAULT_BASE_URL}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button variant="secondary" onClick={loadOllamaModels} disabled={loadingModels}>
                <RefreshCw className={`h-4 w-4 ${loadingModels ? "animate-spin" : ""}`} />
                {loadingModels ? "Lädt…" : "Modelle laden"}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Lokale Ollama-Installation — kein API-Key nötig. Standard: {OLLAMA_DEFAULT_BASE_URL}
            </p>
            {modelLoadError && <p className="mt-1 text-xs text-red-600">{modelLoadError}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Modell</label>
            {ollamaModels.length > 0 ? (
              <div className="relative">
                <select
                  value={effectiveModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {ollamaModels.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}{m.size ? ` — ${formatSize(m.size)}` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  placeholder="z. B. llama3.2 — oder „Modelle laden“ klicken"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Installierte Modelle laden oder den Namen manuell eingeben.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Advanced settings — shared across active providers */}
      {provider !== "disabled" && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            Erweiterte Einstellungen
          </button>
          {showAdvanced && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <Input
                label="Timeout (ms)"
                type="number"
                value={timeoutMs}
                min={5000}
                max={120000}
                step={1000}
                onChange={(e) => setTimeoutMs(Number(e.target.value))}
              />
              <Input
                label="Max. Tokens"
                type="number"
                value={maxTokens}
                min={256}
                max={8192}
                step={256}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
              />
            </div>
          )}
        </div>
      )}

      {/* Test result */}
      {testResult && (
        <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm
          ${testResult.ok
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800"
          }`}>
          {testResult.ok
            ? <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            : <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
          }
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {provider !== "disabled" && (
          <Button
            variant="secondary"
            onClick={handleTest}
            disabled={testDisabled}
          >
            {testing ? "Wird getestet..." : "Verbindung testen"}
          </Button>
        )}
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          <Sparkles className="h-4 w-4" />
          {saving ? "Wird gespeichert..." : "Konfiguration speichern"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" />
            Gespeichert — wirkt sofort
          </span>
        )}
      </div>

      {provider === "disabled" && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          KI-Features sind deaktiviert. Der KI-Vorschlags-Button wird für alle Nutzer ausgeblendet.
        </p>
      )}
    </div>
  );
}
