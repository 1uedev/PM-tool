import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import { safeUser } from "@/lib/validators/user.js";
import UserList from "@/components/admin/UserList.jsx";

export const metadata = { title: "Benutzerverwaltung — PM Copilot" };

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");
  if (session.user.systemRole !== "ADMIN") redirect("/projects");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  const safeUsers = users.map(safeUser);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h1>
          <p className="mt-1 text-sm text-gray-500">
            {users.length} {users.length === 1 ? "Benutzer" : "Benutzer"} im System
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Benutzer anlegen
        </Link>
      </div>

      <UserList users={safeUsers} currentUserId={session.user.id} />
    </div>
  );
}
