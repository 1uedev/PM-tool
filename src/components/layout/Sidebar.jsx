"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, LayoutDashboard } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton.jsx";

const navItems = [
  { label: "Projekte", href: "/projects", icon: FolderOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

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
      <nav className="flex-1 overflow-y-auto px-3 py-4">
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
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3">
        <LogoutButton className="w-full justify-start" />
      </div>
    </aside>
  );
}
