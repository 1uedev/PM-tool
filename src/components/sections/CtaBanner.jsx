"use client";

export default function CtaBanner() {
  return (
    <section className="bg-dark py-20 px-6">
      <div className="max-w-[640px] mx-auto text-center bg-gradient-to-br from-primary/10 to-accent/5 rounded-3xl py-14 px-10 border border-primary/15">
        <h2 className="text-3xl font-bold text-white mb-3">
          Ready to launch?
        </h2>
        <p className="text-slate-400 text-base mb-8">
          Start free. No credit card required. Upgrade anytime.
        </p>
        <div className="flex gap-2 justify-center max-w-[420px] mx-auto">
          <input
            type="email"
            placeholder="you@company.com"
            className="flex-1 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white text-sm outline-none placeholder:text-slate-500 focus:border-primary/40"
          />
          <button className="bg-primary text-white border-none rounded-lg px-6 py-3 text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-primary-dark transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}
