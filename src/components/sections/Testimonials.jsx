"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior PM, TechFlow",
    text: "PM Copilot replaced our entire Notion + Confluence setup for PRD work. Every requirement is now traceable back to a persona and a validated hypothesis.",
    stars: 5,
    avatar: "SC",
  },
  {
    name: "Marcus Rivera",
    role: "Head of Product, DataSync",
    text: "The document import feature cut our onboarding time in half. We uploaded our existing PRD and had 20 structured artifacts in minutes.",
    stars: 5,
    avatar: "MR",
  },
  {
    name: "Lisa Müller",
    role: "VP Product, CloudBase",
    text: "The AI suggestion panel is exactly right — it never auto-applies anything, you always review and accept each suggestion. That's the correct approach for PM work.",
    stars: 5,
    avatar: "LM",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActive((i) => (i + 1) % testimonials.length),
      4500
    );
    return () => clearInterval(timer);
  }, []);

  const t = testimonials[active];

  return (
    <section className="bg-dark-muted py-20 px-6">
      <div className="max-w-[640px] mx-auto text-center">
        <SectionLabel text="What PMs say" />
        <h2 className="text-3xl font-bold text-white mb-12">
          Built for the way PMs actually work
        </h2>

        <div className="bg-dark rounded-2xl p-10 border border-white/5 min-h-[180px]">
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: t.stars }).map((_, i) => (
              <Star key={i} size={16} fill="#f59e0b" className="text-amber-500" />
            ))}
          </div>

          <p className="text-white text-lg leading-relaxed italic mb-6">
            &ldquo;{t.text}&rdquo;
          </p>

          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
              {t.avatar}
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-semibold m-0">{t.name}</p>
              <p className="text-slate-500 text-xs m-0">{t.role}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full border-none cursor-pointer transition-all ${
                i === active
                  ? "w-6 bg-primary"
                  : "w-2 bg-white/15 hover:bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
