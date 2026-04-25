import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth.js";
import { getAiConfig } from "@/lib/ai/provider-factory.js";
import AiProviderConfig from "@/components/admin/AiProviderConfig.jsx";

export const metadata = { title: "KI-Konfiguration — PM Copilot" };

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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">KI-Konfiguration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Wähle einen KI-Provider und konfiguriere das Modell und den API-Key. Änderungen wirken sofort ohne Neustart.
        </p>
      </div>

      <AiProviderConfig initial={safeConfig} />
    </div>
  );
}
