"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionLabel from "@/components/ui/SectionLabel";

const contactInfo = [
  { label: "Email", value: "holger@gerlach.net", icon: "✉️" },
  { label: "GitHub", value: "github.com/1uedev/pm-copilot", icon: "🐙" },
  { label: "Response time", value: "Usually within 48 hours", icon: "💬" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-dark min-h-screen">
      <Navbar />
      <div className="pt-28 pb-24 px-6">
        <div className="max-w-[720px] mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <SectionLabel text="Contact" />
            <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
              Get in touch
            </h1>
            <p className="text-slate-400 text-lg">
              Questions, feedback, or feature ideas — we&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Form */}
            <div>
              {!submitted ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="flex flex-col gap-4"
                >
                  {[
                    { label: "Name", placeholder: "Your name", type: "text" },
                    { label: "Email", placeholder: "you@company.com", type: "email" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-white/70 text-sm font-medium mb-1.5">
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm outline-none placeholder:text-slate-500 focus:border-primary/40"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      placeholder="How can we help?"
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm outline-none resize-y font-[inherit] placeholder:text-slate-500 focus:border-primary/40"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary text-white border-none rounded-lg py-3 text-base font-semibold cursor-pointer mt-1 hover:bg-primary-dark transition-colors"
                  >
                    Send message
                  </button>
                </form>
              ) : (
                <div className="bg-dark-muted rounded-2xl p-10 text-center border border-success/20">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <Check size={24} className="text-success" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">
                    Message sent!
                  </h3>
                  <p className="text-slate-400 text-sm">
                    We&apos;ll get back to you as soon as possible.
                  </p>
                </div>
              )}
            </div>

            {/* Info cards */}
            <div className="flex flex-col gap-5">
              {contactInfo.map((c) => (
                <div
                  key={c.label}
                  className="bg-dark-muted rounded-xl px-6 py-5 border border-white/5 flex items-center gap-4"
                >
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <div className="text-slate-500 text-xs mb-0.5">{c.label}</div>
                    <div className="text-white text-sm font-medium">{c.value}</div>
                  </div>
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
