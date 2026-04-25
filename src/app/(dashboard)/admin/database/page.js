import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth.js";
import { parseDatabaseUrl } from "@/lib/env-config.js";
import DatabaseConfig from "@/components/admin/DatabaseConfig.jsx";

export const metadata = { title: "Datenbank-Konfiguration — PM Copilot" };

export default async function AdminDatabasePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.systemRole !== "ADMIN") redirect("/projects");

  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const current = parseDatabaseUrl(url);
  // Mask password before passing to client
  if (current.password) current.password = "";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Datenbank-Konfiguration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Konfiguriere die Datenbankverbindung für den Produktivbetrieb.
        </p>
      </div>

      <DatabaseConfig initial={current} />
    </div>
  );
}
