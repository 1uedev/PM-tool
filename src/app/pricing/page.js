import { Check, Github } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionLabel from "@/components/ui/SectionLabel";

export const metadata = { title: "Pricing — PM Copilot" };

const included = [
  "All 35 artifact types",
  "Unlimited projects and artifacts",
  "AI suggestions (bring your own API key)",
  "Document import with AI extraction",
  "Interactive artifact graph",
  "Traceability view with gap detection",
  "Version history on every artifact",
  "Board view with drag & drop",
  "Full-text search with filters",
  "Role-based access (Owner / Editor / Viewer)",
  "Admin user management",
  "Multilingual (DE / EN)",
  "JSON and CSV export",
  "SQLite by default, PostgreSQL / MariaDB configurable",
];

export default function PricingPage() {
  return (
    <div className="bg-dark min-h-screen">
      <Navbar />
      <div className="pt-28 pb-24 px-6">
        <div className="max-w-[800px] mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <SectionLabel text="Pricing" />
            <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
              Free. Forever. Self-hosted.
            </h1>
            <p className="text-slate-400 text-lg max-w-[520px] mx-auto">
              PM Copilot is open source and self-hosted. There are no tiers, no usage limits,
              and no vendor lock-in. You run it; you own your data.
            </p>
          </div>

          {/* Single plan card */}
          <div className="rounded-2xl p-[2px] bg-gradient-to-br from-primary to-accent">
            <div className="bg-dark-muted rounded-2xl p-10">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <div className="inline-block bg-primary/20 text-primary-light text-xs font-bold px-2.5 py-1 rounded-md mb-2 uppercase tracking-wider">
                    Everything included
                  </div>
                  <h2 className="text-white text-3xl font-bold">Self-hosted</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Run on your own infrastructure — one command to get started
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-5xl font-extrabold text-white">$0</span>
                  <span className="text-slate-400 text-base ml-1">/ forever</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {included.map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-white/80 text-sm">
                    <Check size={14} className="text-success flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/login"
                  className="inline-block bg-primary text-white no-underline rounded-lg px-8 py-3 text-base font-semibold hover:bg-primary-dark transition-colors"
                >
                  Get started
                </Link>
                <a
                  href="https://github.com"
                  className="inline-flex items-center gap-2 bg-transparent text-white border border-white/20 no-underline rounded-lg px-8 py-3 text-base font-semibold hover:bg-white/5 transition-colors"
                >
                  <Github size={18} /> View on GitHub
                </a>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Common questions
            </h2>
            <div className="flex flex-col gap-6">
              {[
                {
                  q: "What do I need to run PM Copilot?",
                  a: "Node.js 20+ and npm. The default database is SQLite — no external dependencies needed. Clone the repo, copy .env, run npm install && npx prisma migrate dev && npm run dev and you're running.",
                },
                {
                  q: "Do I need an AI API key?",
                  a: "No. AI features are optional — the artifact explorer, relations, version history, board view, and everything else works without any API key. You only need a key (Claude or OpenAI) to use the AI suggestion button and document import.",
                },
                {
                  q: "Can I use PostgreSQL or MariaDB instead of SQLite?",
                  a: "Yes. The admin panel includes a database configuration UI where you can switch providers, enter connection details, and test the connection. A server restart and prisma migrate deploy are still required after switching.",
                },
                {
                  q: "Is there a hosted / cloud version?",
                  a: "Not currently. PM Copilot is designed for teams who want full control over their product data. Self-hosting is the intended model.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="bg-dark-muted rounded-xl p-6 border border-white/5">
                  <h3 className="text-white font-semibold mb-2">{q}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed m-0">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
