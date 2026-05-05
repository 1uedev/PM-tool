"use client";

import { useState } from "react";
import { Sparkles, CheckCircle, XCircle, Eye, EyeOff, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const PROVIDERS = [
  {
    value: "claude",
    label: "Anthropic Claude",
    logo: "🟠",
    description: "Leistungsstarke KI von Anthropic",
    keyPlaceholder: "sk-ant-api03-...",
    keyHint: "API-Key aus console.anthropic.com",
    models: [
      { value: "claude-opus-4-6",          label: "Claude Opus 4.6",   badge: "Leistungsstark" },
      { value: "claude-sonnet-4-6",         label: "Claude Sonnet 4.6", badge: "Empfohlen" },
      { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5",  badge: "Schnell" },
    ],
  },
  {
    value: "openai",
    label: "OpenAI",
    logo: "🟢",
    description: "GPT-Modelle von OpenAI",
    keyPlaceholder: "sk-proj-...",
    keyHint: "API-Key aus platform.openai.com",
    models: [
      { value: "gpt-4o",       label: "GPT-4o",       badge: "Leistungsstark" },
      { value: "gpt-4o-mini",  label: "GPT-4o mini",  badge: "Empfohlen" },
      { value: "gpt-4-turbo",  label: "GPT-4 Turbo",  badge: "Schnell" },
    ],
  },
  {
    value: "disabled",
    label: "Deaktiviert",
    logo: "⭕",
    description: "KI-Features sind ausgeschaltet",
    models: [],
  },
];

const BADGE_COLORS = {
  "Empfohlen":      "bg-blue-50 text-blue-700 border-blue-200",
  "Leistungsstark": "bg-purple-50 text-purple-700 border-purple-200",
  "Schnell":        "bg-green-50 text-green-700 border-green-200",
};

function ModelSelect({ models, value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {models.map((m) => (
          <option key={m.value} value={m.value}>{m.label} — {m.badge}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
    </div>
  );
}

export default function AiProviderConfig({ initial }) {
  const [provider, setProvider] = useState(initial.provider ?? "disabled");
  const [model, setModel] = useState(initial.model ?? "");
  const [apiKey, setApiKey] = useState("");          // never pre-filled from server
  const [showKey, setShowKey] = useState(false);
  const [timeoutMs, setTimeoutMs] = useState(initial.timeoutMs ?? 30000);
  const [maxTokens, setMaxTokens] = useState(initial.maxTokens ?? 2048);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(initial.apiKeySet ?? false);

  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const selectedProvider = PROVIDERS.find((p) => p.value === provider);

  function handleProviderChange(val) {
    setProvider(val);
    setModel(""); // reset model when provider changes
    setTestResult(null);
    setSaved(false);
  }

  function handleModelChange(val) {
    setModel(val);
    setTestResult(null);
    setSaved(false);
  }

  // Effective model: use selected or default to first in list
  const effectiveModel = model || selectedProvider?.models[0]?.value || "";

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    setError("");
    try {
      const res = await fetch("/api/admin/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model: effectiveModel, apiKey: apiKey || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Fehler");
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
      if (apiKey) body.apiKey = apiKey;

      const res = await fetch("/api/admin/ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Fehler");
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
        <div className="grid grid-cols-3 gap-3">
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

      {/* Model + API key — only when not disabled */}
      {provider !== "disabled" && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-900">Modell & API-Key</h2>

          {/* Model */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Modell</label>
            {selectedProvider?.models.length > 0 && (
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
            )}
          </div>

          {/* API Key */}
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

          {/* Advanced settings */}
          <div>
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
            disabled={testing || (!apiKey && !apiKeySet)}
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
