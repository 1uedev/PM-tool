import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getLocale } from "next-intl/server";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import Sidebar from "@/components/layout/Sidebar.jsx";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [locale, languages] = await Promise.all([
    getLocale(),
    prisma.language.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar languages={languages} currentLocale={locale} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
