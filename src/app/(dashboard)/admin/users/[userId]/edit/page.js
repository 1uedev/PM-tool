import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import { safeUser } from "@/lib/validators/user.js";
import UserForm from "@/components/admin/UserForm.jsx";

export const metadata = { title: "Benutzer bearbeiten — PM Copilot" };

export default async function EditUserPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");
  if (session.user.systemRole !== "ADMIN") redirect("/projects");

  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) notFound();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href="/admin/users"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Zurück zur Übersicht
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-gray-900">Benutzer bearbeiten</h1>
      <p className="mb-6 text-sm text-gray-500">{user.email}</p>

      <UserForm user={safeUser(user)} />
    </div>
  );
}
