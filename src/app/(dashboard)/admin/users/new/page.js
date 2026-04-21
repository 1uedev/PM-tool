import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth.js";
import UserForm from "@/components/admin/UserForm.jsx";

export const metadata = { title: "Benutzer anlegen — PM Copilot" };

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");
  if (session.user.systemRole !== "ADMIN") redirect("/projects");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href="/admin/users"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Zurück zur Übersicht
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Neuen Benutzer anlegen</h1>

      <UserForm />
    </div>
  );
}
