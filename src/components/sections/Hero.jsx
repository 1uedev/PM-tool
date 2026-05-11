import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(6,182,212,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid" />

      <div className="relative text-center max-w-[760px]">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
          <span className="text-sm text-success font-medium">
            Free &amp; Open Source — Self-hosted
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-5 text-white">
          Structure your product
          <br />
          <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
            from problem to launch
          </span>
        </h1>

        {/* Subline */}
        <p className="text-lg text-slate-400 leading-relaxed max-w-[560px] mx-auto mb-9">
          PM Copilot organises every PM artifact — personas, hypotheses, use cases,
          user stories, requirements, and 29 more — in a single traceable system,
          with AI drafting assistance and version history on every save.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-primary text-white rounded-lg px-6 py-3 text-base font-semibold no-underline hover:bg-primary-dark transition-colors"
          >
            Get started free <ArrowRight size={18} />
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center gap-2 bg-transparent text-white border border-white/20 rounded-lg px-6 py-3 text-base font-semibold no-underline hover:bg-white/5 transition-colors"
          >
            See features
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
          {[
            "35 artifact types",
            "AI-powered drafting",
            "Full traceability",
          ].map((stat) => (
            <div
              key={stat}
              className="flex items-center gap-1.5 text-slate-400 text-sm"
            >
              <Check size={14} className="text-success" />
              {stat}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
