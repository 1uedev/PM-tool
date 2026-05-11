import { FolderOpen, GitBranch, Sparkles, History, ArrowRight } from "lucide-react";
import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";

const features = [
  {
    icon: FolderOpen,
    title: "Structured Explorer",
    desc: "35 artifact types across 8 domain groups — all in a two-column workspace. Type-specific forms, status tracking, and unsaved-change guards built in.",
    color: "primary",
  },
  {
    icon: GitBranch,
    title: "Relations & Traceability",
    desc: "Every link between artifacts is explicit and typed. The traceability view shows coverage per group, gaps to fill, and the full dependency graph.",
    color: "accent",
  },
  {
    icon: Sparkles,
    title: "AI Assistance",
    desc: "Per-artifact AI suggestions from Claude or OpenAI — shown in a separate panel, never auto-applied. Upload existing documents and bulk-create artifacts from the content.",
    color: "success",
  },
  {
    icon: History,
    title: "Version History",
    desc: "Every save creates a new version automatically. Compare, restore, and track exactly what changed and when — for every artifact in the project.",
    color: "amber",
  },
];

const colorMap = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "hover:border-primary/30" },
  accent: { bg: "bg-accent/10", text: "text-accent", border: "hover:border-accent/30" },
  success: { bg: "bg-success/10", text: "text-success", border: "hover:border-success/30" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "hover:border-amber-500/30" },
};

export default function FeatureHighlights() {
  return (
    <section className="bg-dark py-24 px-6">
      <div className="max-w-[1200px] mx-auto text-center">
        <SectionLabel text="Features" />
        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
          Everything a PM needs in one place
        </h2>
        <p className="text-slate-400 text-base max-w-[520px] mx-auto mb-14">
          From the first problem statement to the launch checklist — structured,
          connected, and always traceable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            const colors = colorMap[f.color];
            return (
              <div
                key={f.title}
                className={`bg-dark-muted border border-white/5 rounded-2xl p-8 text-left transition-colors ${colors.border}`}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text} mb-4`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed m-0">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 bg-transparent text-white border border-white/20 rounded-lg px-5 py-2.5 text-sm font-semibold no-underline hover:bg-white/5 transition-colors"
          >
            Explore all features <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
