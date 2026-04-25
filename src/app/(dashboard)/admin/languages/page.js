import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import LanguageManager from "@/components/admin/LanguageManager.jsx";

export const metadata = { title: "Sprachverwaltung — PM Copilot" };

export default async function AdminLanguagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");
  if (session.user.systemRole !== "ADMIN") redirect("/projects");

  const languages = await prisma.language.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sprachverwaltung</h1>
        <p className="mt-1 text-sm text-gray-500">
          Verwalte die verfügbaren Sprachen der Anwendung.
        </p>
      </div>

      <LanguageManager initialLanguages={languages} />
    </div>
  );
}
