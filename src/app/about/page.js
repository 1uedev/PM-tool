import { LayoutDashboard, GitBranch, Sparkles, History } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionLabel from "@/components/ui/SectionLabel";

export const metadata = { title: "About — PM Copilot" };

const principles = [
  {
    icon: LayoutDashboard,
    title: "Structure over prose",
    desc: "Every PM artifact has a type, typed fields, and a status. No more wall-of-text Notion pages where the product vision is buried three scrolls deep.",
  },
  {
    icon: GitBranch,
    title: "Traceability by default",
    desc: "Relations between artifacts are first-class. You can always answer 'what hypothesis does this user story validate?' and 'what features are still missing for this release?'",
  },
  {
    icon: Sparkles,
    title: "AI as a drafting assistant — never a decision-maker",
    desc: "AI suggestions are always shown separately and always require explicit acceptance. The PM stays in control of every word that gets committed.",
  },
  {
    icon: History,
    title: "Nothing is lost",
    desc: "Every save creates a version. Every delete is a soft delete. Restore any artifact or any field to any point in history.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-dark min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <SectionLabel text="About" />
            <h1 className="text-5xl font-extrabold text-white tracking-tight mb-5">
              Built to end PM fragmentation
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-[620px] mx-auto">
              Product decisions are scattered across Notion documents, Jira tickets,
              Confluence pages, and Figma comments — with no consistent structure and
              no explicit links between them. PM Copilot is the workspace that connects
              all of it.
            </p>
          </div>

          {/* Problem statement */}
          <div className="bg-dark-muted rounded-2xl p-10 border border-white/5 mb-16">
            <h2 className="text-2xl font-bold text-white mb-4">The problem</h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              A product manager typically maintains a PRD in a long-form document, user
              stories in Jira, personas in a slide deck, and the product vision in a
              separate Notion page — if it exists at all. None of these are connected.
              When a requirement changes, no one knows which hypothesis it came from or
              which use cases it affects.
            </p>
            <p className="text-slate-400 leading-relaxed">
              PM Copilot gives every piece of product information a <strong className="text-white">type</strong>,
              a <strong className="text-white">status</strong>, and <strong className="text-white">explicit
              links</strong> to related artifacts. The result is a living, navigable product
              graph — not a folder of documents.
            </p>
          </div>

          {/* Principles */}
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Design principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-dark-muted rounded-2xl p-8 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{p.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed m-0">{p.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Tech stack */}
          <div className="bg-dark-muted rounded-2xl p-10 border border-white/5">
            <h2 className="text-xl font-bold text-white mb-6">Built with</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ["Next.js 15", "App Router, Server Components"],
                ["Prisma 7", "SQLite / PostgreSQL / MariaDB"],
                ["NextAuth.js 4", "JWT sessions, credentials"],
                ["Tailwind CSS 3", "Utility-first styling"],
                ["SWR", "Client-side data fetching"],
                ["Zod 3", "Shared validation"],
                ["Anthropic Claude", "AI suggestions"],
                ["OpenAI", "Alternative AI provider"],
              ].map(([name, desc]) => (
                <div key={name} className="bg-dark rounded-xl p-4 border border-white/5">
                  <div className="text-white text-sm font-semibold mb-0.5">{name}</div>
                  <div className="text-slate-500 text-xs">{desc}</div>
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
