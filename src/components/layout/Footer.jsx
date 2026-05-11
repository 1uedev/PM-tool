import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { SITE } from "@/lib/constants";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: "https://github.com" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-white/5 pt-12 pb-8 px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <LayoutDashboard size={14} className="text-white" />
            </div>
            <span className="text-base font-bold text-white">{SITE.name}</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            {SITE.description}
          </p>
        </div>

        {/* Link columns */}
        {footerSections.map((section) => (
          <div key={section.title}>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              {section.title}
            </h4>
            <ul className="list-none p-0 m-0 space-y-2">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-500 text-sm hover:text-white transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-[1200px] mx-auto mt-10 pt-6 border-t border-white/5 text-center text-slate-500 text-xs">
        &copy; {new Date().getFullYear()} {SITE.name}. Free and open source.
      </div>
    </footer>
  );
}
