import { Zap, BarChart3, Shield, Users, Check } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";

const features = [
  {
    icon: Zap,
    title: "Instant Deployments",
    desc: "Deploy to global edge networks in under 5 seconds. Zero-config, zero-downtime, with automatic rollbacks if anything goes wrong.",
    color: "primary",
    details: ["Global CDN", "Auto-scaling", "Preview URLs", "Rollback in 1 click"],
  },
  {
    icon: BarChart3,
    title: "Built-in Analytics",
    desc: "Real-time dashboards, funnel analysis, and user session replays — no third-party tools needed.",
    color: "accent",
    details: ["Real-time dashboards", "Funnel tracking", "Session replays", "Custom events"],
  },
  {
    icon: Shield,
    title: "Security First",
    desc: "Enterprise-grade security with SOC 2 Type II certification, SSO, and granular role-based access.",
    color: "success",
    details: ["SOC 2 Type II", "SSO / SAML", "RBAC", "Audit logs"],
  },
  {
    icon: Users,
    title: "Multiplayer Collaboration",
    desc: "Work together in real-time with live cursors, inline comments, and approval workflows.",
    color: "amber",
    details: ["Live cursors", "Inline comments", "Approval flows", "Branching"],
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
    <div className="bg-dark pt-28 pb-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionLabel text="Features" />
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
            Powerful by default
          </h1>
          <p className="text-slate-400 text-lg max-w-[520px] mx-auto">
            Every feature is designed to help your team move faster without
            sacrificing quality or security.
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
                  className={`p-12 flex flex-col justify-center ${
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
                    {/* Window chrome */}
                    <div className="h-8 bg-white/[0.03] flex items-center gap-1.5 px-3 border-b border-white/5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    {/* Skeleton content */}
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
  );
}
