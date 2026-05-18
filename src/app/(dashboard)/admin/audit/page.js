import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth.js";
import AuditLogTable from "@/components/admin/AuditLogTable.jsx";

export const metadata = { title: "Audit-Log — PM Copilot" };

export default async function AdminAuditPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.systemRole !== "ADMIN") redirect("/projects");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit-Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Protokoll destruktiver Aktionen: gelöschte Artefakte, wiederhergestellte Versionen, archivierte Projekte.
        </p>
      </div>
      <AuditLogTable />
    </div>
  );
}
