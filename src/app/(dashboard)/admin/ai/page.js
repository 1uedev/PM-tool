import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth.js";
import { getAiConfig } from "@/lib/ai/provider-factory.js";
import prisma from "@/lib/prisma.js";
import AiProviderConfig from "@/components/admin/AiProviderConfig.jsx";

export const metadata = { title: "KI-Konfiguration — PM Copilot" };

const MODE_LABELS = {
  suggest: "Feld-Vorschläge",
  import: "Dokument-Import",
};

function formatTokens(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} k`;
  return String(n);
}

async function loadUsageStats() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    const [totals, byMode] = await Promise.all([
      prisma.aiSession.aggregate({
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        _sum: { inputTokens: true, outputTokens: true },
        _avg: { durationMs: true },
      }),
      prisma.aiSession.groupBy({
        by: ["mode"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        _sum: { inputTokens: true, outputTokens: true },
      }),
    ]);
    return { totals, byMode };
  } catch {
    return null;
  }
}

export default async function AdminAiPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.systemRole !== "ADMIN") redirect("/projects");

  const config = await getAiConfig();
  // Never pass the raw API key to the client
  const safeConfig = {
    provider: config.provider,
    model: config.model,
    apiKeySet: config.apiKey.length > 0,
    timeoutMs: config.timeoutMs,
    maxTokens: config.maxTokens,
  };

  const usage = await loadUsageStats();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">KI-Konfiguration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Wähle einen KI-Provider und konfiguriere das Modell und den API-Key. Änderungen wirken sofort ohne Neustart.
        </p>
      </div>

      <AiProviderConfig initial={safeConfig} />

      {/* Usage stats — last 30 days */}
      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Nutzung (letzte 30 Tage)</h2>
        {!usage || usage.totals._count._all === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            Noch keine KI-Anfragen protokolliert.
          </p>
        ) : (
          <>
            <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-gray-500">Anfragen</dt>
                <dd className="text-lg font-semibold text-gray-900">{usage.totals._count._all}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Input-Tokens</dt>
                <dd className="text-lg font-semibold text-gray-900">{formatTokens(usage.totals._sum.inputTokens)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Output-Tokens</dt>
                <dd className="text-lg font-semibold text-gray-900">{formatTokens(usage.totals._sum.outputTokens)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Ø Dauer</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {usage.totals._avg.durationMs ? `${(usage.totals._avg.durationMs / 1000).toFixed(1)} s` : "—"}
                </dd>
              </div>
            </dl>

            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="py-1.5 font-medium">Funktion</th>
                  <th className="py-1.5 font-medium text-right">Anfragen</th>
                  <th className="py-1.5 font-medium text-right">Input</th>
                  <th className="py-1.5 font-medium text-right">Output</th>
                </tr>
              </thead>
              <tbody>
                {usage.byMode.map((row) => (
                  <tr key={row.mode} className="border-b border-gray-50 last:border-0">
                    <td className="py-1.5 text-gray-700">{MODE_LABELS[row.mode] ?? row.mode}</td>
                    <td className="py-1.5 text-right text-gray-700">{row._count._all}</td>
                    <td className="py-1.5 text-right text-gray-700">{formatTokens(row._sum.inputTokens)}</td>
                    <td className="py-1.5 text-right text-gray-700">{formatTokens(row._sum.outputTokens)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-3 text-xs text-gray-400">
              Token-Zahlen stammen aus den Provider-Antworten; ältere Einträge ohne Token-Daten zählen nur bei den Anfragen.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
