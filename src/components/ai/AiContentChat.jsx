"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MessagesSquare, X, Send, Sparkles, ArrowRight, Check } from "lucide-react";
import Spinner from "@/components/ui/Spinner.jsx";
import { ARTIFACT_FIELD_DEFS } from "@/lib/artifactFields.js";

let messageSeq = 0;
const nextId = () => `m${++messageSeq}`;

// Strip HTML tags for a readable "before/after" preview of rich-text fields.
function toPlain(value) {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Generic chat for any AI-generated artifact. History lives only in React
 * state (not persisted). On an applied change, calls onApplied(updatedArtifact).
 */
export default function AiContentChat({ projectId, artifactId, artifactType, artifact, canEdit, onApplied }) {
  const t = useTranslations("aiChat");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { id, role, content, proposal? }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState(null);
  const scrollRef = useRef(null);

  const fieldDefs = ARTIFACT_FIELD_DEFS[artifactType] ?? [];
  const fieldLabel = useCallback(
    (key) => (key === "title" ? t("titleField") : fieldDefs.find((f) => f.key === key)?.label ?? key),
    [fieldDefs, t]
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setError("");
    const userMsg = { id: nextId(), role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/artifacts/${artifactId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error?.message ?? t("error"));
        return;
      }
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", content: json.data.reply || "", proposal: json.data.proposal ?? null },
      ]);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  async function applyProposal(msgId, proposal) {
    setApplyingId(msgId);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/artifacts/${artifactId}/chat/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: proposal.field, newValue: proposal.newValue, rationale: proposal.rationale }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error?.message ?? t("applyError"));
        return;
      }
      onApplied?.(json.data);
      // Mark the proposal as applied and add a system note
      setMessages((prev) => [
        ...prev.map((m) => (m.id === msgId ? { ...m, proposal: { ...m.proposal, applied: true } } : m)),
        { id: nextId(), role: "system", content: t("applied", { field: fieldLabel(proposal.field) }) },
      ]);
    } catch {
      setError(t("applyError"));
    } finally {
      setApplyingId(null);
    }
  }

  function dismissProposal(msgId) {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, proposal: { ...m.proposal, dismissed: true } } : m))
    );
  }

  function beforeValue(field) {
    if (field === "title") return artifact?.title ?? "";
    const fields = artifact?.fields ?? {};
    return fields[field] ?? "";
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 self-start rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100"
      >
        <MessagesSquare className="h-4 w-4" />
        {t("trigger")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={t("title")}>
          <div className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t("title")}</p>
                  <p className="text-xs text-gray-400">{t("subtitle")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && !loading && (
                <p className="rounded-lg bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
                  {t("empty")}
                </p>
              )}

              {messages.map((m) => {
                if (m.role === "system") {
                  return (
                    <div key={m.id} className="flex items-center justify-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
                        <Check className="h-3 w-3" /> {m.content}
                      </span>
                    </div>
                  );
                }
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
                      <div
                        className={`whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                          isUser ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {m.content}
                      </div>

                      {/* Change proposal — before/after with confirm */}
                      {m.proposal && !m.proposal.dismissed && (
                        <div className="mt-2 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3">
                          <p className="mb-2 text-xs font-semibold text-indigo-700">
                            {t("proposalTitle")} · {fieldLabel(m.proposal.field)}
                          </p>
                          <div className="space-y-1.5 text-xs">
                            <div>
                              <span className="text-gray-400">{t("before")}</span>
                              <p className="rounded bg-red-50 px-2 py-1 text-gray-700 line-through decoration-red-300">
                                {toPlain(beforeValue(m.proposal.field)) || "—"}
                              </p>
                            </div>
                            <div className="flex justify-center text-gray-300">
                              <ArrowRight className="h-3 w-3 rotate-90" />
                            </div>
                            <div>
                              <span className="text-gray-400">{t("after")}</span>
                              <p className="rounded bg-green-50 px-2 py-1 text-gray-800">
                                {toPlain(m.proposal.newValue) || "—"}
                              </p>
                            </div>
                          </div>
                          {m.proposal.rationale && (
                            <p className="mt-2 text-xs italic text-gray-500">{m.proposal.rationale}</p>
                          )}
                          {m.proposal.applied ? (
                            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
                              <Check className="h-3 w-3" /> {t("appliedShort")}
                            </p>
                          ) : (
                            <div className="mt-3 flex items-center gap-2">
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => applyProposal(m.id, m.proposal)}
                                  disabled={applyingId === m.id}
                                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                  {applyingId === m.id ? <Spinner className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                  {t("apply")}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => dismissProposal(m.id)}
                                className="rounded-lg px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
                              >
                                {t("dismiss")}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-500">
                    <Spinner className="h-4 w-4" /> {t("thinking")}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mx-4 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-200 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={2}
                  placeholder={t("placeholder")}
                  className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={loading || !input.trim()}
                  aria-label={t("send")}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
