"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, LayoutDashboard, Users, Globe2, Database, Sparkles, UserCircle, ClipboardList } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import LogoutButton from "@/components/auth/LogoutButton.jsx";
import LanguagePicker from "@/components/layout/LanguagePicker.jsx";

export default function Sidebar({ languages = [], currentLocale = "de" }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.systemRole === "ADMIN";
  const t = useTranslations();

  const navItems = [
    { label: t("nav.projects"), href: "/projects", icon: FolderOpen },
  ];

  const adminNavItems = [
    { label: t("nav.users"), href: "/admin/users", icon: Users },
    { label: t("nav.languages"), href: "/admin/languages", icon: Globe2 },
    { label: t("nav.database"), href: "/admin/database", icon: Database },
    { label: t("nav.ai"), href: "/admin/ai", icon: Sparkles },
    { label: t("nav.audit"), href: "/admin/audit", icon: ClipboardList },
  ];

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <Link href="/projects" className="flex items-center gap-2 font-semibold text-gray-900">
          <LayoutDashboard className="h-5 w-5 text-blue-600" />
          PM Copilot
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        <ul className="flex flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    ${active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {isAdmin && (
          <div>
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t("nav.administration")}
            </p>
            <ul className="flex flex-col gap-1">
              {adminNavItems.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                        ${active
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 flex flex-col gap-1">
        {languages.length > 1 && (
          <LanguagePicker languages={languages} currentLocale={currentLocale} />
        )}
        <Link
          href="/account"
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors
            ${pathname === "/account"
              ? "bg-blue-50 text-blue-700 font-medium"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
        >
          <UserCircle className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{session?.user?.name || session?.user?.email || "Konto"}</span>
        </Link>
        <LogoutButton className="w-full justify-start" />
      </div>
    </aside>
  );
}
