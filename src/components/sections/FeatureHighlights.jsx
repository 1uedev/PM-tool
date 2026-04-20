import { Zap, BarChart3, Shield, Users, ArrowRight } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

const features = [
  {
    icon: Zap,
    title: "Lightning Deploy",
    desc: "Push to production in seconds with zero-downtime deployments and automatic rollbacks.",
    color: "primary",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    desc: "Understand your users with built-in analytics, heatmaps, and funnel tracking.",
    color: "accent",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "SOC 2 certified with SSO, RBAC, audit logs, and end-to-end encryption.",
    color: "success",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Real-time multiplayer editing, comments, and approval workflows built in.",
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
          Everything you need to ship
        </h2>
        <p className="text-slate-400 text-base max-w-[480px] mx-auto mb-14">
          Powerful tools that work together seamlessly, so your team can focus on
          what matters.
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
          <Button variant="outline" href="/features">
            Explore all features <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </section>
  );
}
