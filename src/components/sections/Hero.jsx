import { ArrowRight, Play, Check } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid" />

      <div className="relative text-center max-w-[720px]">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
          <span className="text-sm text-success font-medium">
            Now in Public Beta — Free for early adopters
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-5">
          Ship products
          <br />
          <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
            10x faster
          </span>
        </h1>

        {/* Subline */}
        <p className="text-lg text-slate-400 leading-relaxed max-w-[520px] mx-auto mb-9">
          The all-in-one platform for modern teams. Build, deploy, and scale
          your applications with built-in analytics, collaboration, and
          security.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Button href="/contact">
            Start Building Free <ArrowRight size={18} />
          </Button>
          <Button variant="secondary">
            <Play size={16} /> Watch Demo
          </Button>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
          {["12k+ developers", "99.9% uptime", "SOC 2 certified"].map(
            (stat) => (
              <div
                key={stat}
                className="flex items-center gap-1.5 text-slate-400 text-sm"
              >
                <Check size={14} className="text-success" />
                {stat}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
