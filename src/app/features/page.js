import {
  FolderOpen,
  GitBranch,
  Sparkles,
  History,
  Check,
  LayoutDashboard,
  FileSearch,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionLabel from "@/components/ui/SectionLabel";

export const metadata = { title: "Features — PM Copilot" };

const features = [
  {
    icon: FolderOpen,
    title: "Structured Artifact Explorer",
    desc: "A two-column workspace for all 35 PM artifact types across 8 domain groups. The left panel shows a collapsible artifact tree grouped by domain; the right panel shows type-specific edit forms with tailored UX for each artifact.",
    color: "primary",
    details: [
      "35 artifact types, 8 domain groups",
      "Type-specific field forms",
      "Status tracking (Draft / In Review / Done)",
      "Unsaved-change guards",
      "Tag assignment and filtering",
      "Full-text search (⌘K)",
    ],
  },
  {
    icon: GitBranch,
    title: "Relations, Graph & Traceability",
    desc: "Every connection between artifacts is explicit and typed — Derives From, Depends On, Relates To, or Validates. The graph view shows the full artifact map as an interactive node canvas; the traceability view shows coverage, gaps, and filter-by-type.",
    color: "accent",
    details: [
      "4 relation types with smart suggestions",
      "Interactive artifact graph (drag to connect)",
      "Traceability view with gap detection",
      "Coverage bars per domain group",
      "Filter by status, relation type, visibility",
      "Direct '+ Create' links for missing types",
    ],
  },
  {
    icon: Sparkles,
    title: "AI Assistance",
    desc: "Per-artifact AI suggestions from Claude or OpenAI — always shown in a separate panel, never auto-applied. Every suggestion requires explicit acceptance. Upload existing documents (PDF, DOCX, TXT, MD) and let AI extract and pre-fill artifacts from the content.",
    color: "success",
    details: [
      "AI suggestions for all 35 artifact types",
      "Claude and OpenAI support",
      "Suggestions shown separately, never auto-applied",
      "Document import with AI extraction",
      "Bulk create from uploaded documents",
      "Admin-configurable provider and model",
    ],
  },
  {
    icon: History,
    title: "Version History",
    desc: "Every save creates a new version automatically. Compare fields between any two versions, restore any previous state with one click, and track exactly who changed what and when.",
    color: "amber",
    details: [
      "Auto-version on every save",
      "Full field diff per version",
      "Restore any previous version",
      "Author and timestamp per version",
      "Confirmation dialog before restore",
      "Versions survive status-cycle changes",
    ],
  },
  {
    icon: LayoutDashboard,
    title: "Views: Board, Progress, Starter",
    desc: "Switch between Explorer, Board (Kanban), Progress overview, and the PRD Starter — a 10-question onboarding that populates context across all artifact forms so high-level decisions stay consistent with detailed content.",
    color: "primary",
    details: [
      "Kanban board with drag & drop",
      "Progress overview per domain group",
      "Missing artifact callouts with create links",
      "PRD Starter (10 questions, completion bar)",
      "Inline starter context per artifact type",
      "Deep-linkable via URL params",
    ],
  },
  {
    icon: FileSearch,
    title: "Admin, Access & Export",
    desc: "Three-tier access control (Owner / Editor / Viewer) enforced in both API and UI. Admin panel for user management, language settings, database configuration, and AI provider setup. Export all artifacts as JSON or CSV.",
    color: "success",
    details: [
      "Owner / Editor / Viewer roles per project",
      "Admin user management (create / deactivate)",
      "Database config (SQLite / PostgreSQL / MariaDB)",
      "AI provider config (no restart needed)",
      "Export artifacts as JSON or CSV",
      "Multilingual (DE / EN, cookie-based)",
    ],
  },
];

const colorMap = {
  primary: { bg: "bg-primary/10", text: "text-primary", mockup: "bg-primary/20", mockupBorder: "border-primary/15" },
  accent: { bg: "bg-accent/10", text: "text-accent", mockup: "bg-accent/20", mockupBorder: "border-accent/15" },
  success: { bg: "bg-success/10", text: "text-success", mockup: "bg-success/20", mockupBorder: "border-success/15" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", mockup: "bg-amber-500/20", mockupBorder: "border-amber-500/15" },
};

export default function FeaturesPage() {
  return (
    <div className="bg-dark min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <SectionLabel text="Features" />
            <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
              Everything in one structured workspace
            </h1>
            <p className="text-slate-400 text-lg max-w-[540px] mx-auto">
              35 artifact types, explicit relations, AI drafting, and full version history —
              purpose-built for structured product management.
            </p>
          </div>

          {/* Feature rows */}
          <div className="flex flex-col gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              const colors = colorMap[f.color];
              return (
                <div
                  key={f.title}
                  className="grid grid-cols-1 md:grid-cols-2 bg-dark-muted rounded-2xl overflow-hidden border border-white/5"
                >
                  {/* Text side */}
                  <div
                    className={`p-10 flex flex-col justify-center ${
                      i % 2 === 0 ? "md:order-1" : "md:order-2"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text} mb-5`}
                    >
                      <Icon size={24} />
                    </div>
                    <h3 className="text-white text-2xl font-bold mb-3">
                      {f.title}
                    </h3>
                    <p className="text-slate-400 text-base leading-relaxed mb-6">
                      {f.desc}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {f.details.map((d) => (
                        <div
                          key={d}
                          className="flex items-center gap-2 text-white/80 text-sm"
                        >
                          <Check size={14} className={colors.text} /> {d}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mockup side */}
                  <div
                    className={`${colors.bg} flex items-center justify-center p-10 ${
                      i % 2 === 0 ? "md:order-2" : "md:order-1"
                    }`}
                  >
                    <div className="w-full max-w-[360px] aspect-[4/3] rounded-xl bg-dark border border-white/10 flex flex-col overflow-hidden">
                      <div className="h-8 bg-white/[0.03] flex items-center gap-1.5 px-3 border-b border-white/5">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1 p-4 flex flex-col gap-2">
                        <div className={`h-2 w-3/5 ${colors.mockup} rounded`} />
                        <div className="h-2 w-4/5 bg-white/5 rounded" />
                        <div className="h-2 w-2/5 bg-white/5 rounded" />
                        <div
                          className={`flex-1 mt-2 ${colors.bg} rounded-lg border ${colors.mockupBorder}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
