"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Menu, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/constants";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-dark/92 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            {SITE.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors pb-0.5 no-underline ${
                  isActive
                    ? "text-primary-light border-b-2 border-primary"
                    : "text-white/65 hover:text-white border-b-2 border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="bg-primary text-white rounded-lg px-5 py-2 text-sm font-semibold no-underline hover:bg-primary-dark transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden bg-transparent border-none text-white cursor-pointer"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark px-6 py-4 flex flex-col gap-3 border-t border-white/5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-base text-white no-underline py-2"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
