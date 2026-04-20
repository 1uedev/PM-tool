"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";

const plans = [
  {
    name: "Starter",
    priceAnnual: 0,
    priceMonthly: 0,
    period: "forever",
    desc: "For side projects and experiments",
    cta: "Start Free",
    featured: false,
    features: [
      "1 project",
      "10k requests/mo",
      "Community support",
      "Basic analytics",
      "Shared infrastructure",
    ],
  },
  {
    name: "Pro",
    priceAnnual: 29,
    priceMonthly: 39,
    period: "/month",
    desc: "For growing teams and products",
    cta: "Start Free Trial",
    featured: true,
    features: [
      "Unlimited projects",
      "1M requests/mo",
      "Priority support",
      "Advanced analytics",
      "Custom domains",
      "Team collaboration",
      "SSO",
    ],
  },
  {
    name: "Enterprise",
    priceAnnual: null,
    priceMonthly: null,
    period: "",
    desc: "For large-scale deployments",
    cta: "Contact Sales",
    featured: false,
    features: [
      "Everything in Pro",
      "Unlimited requests",
      "24/7 dedicated support",
      "Custom SLA",
      "RBAC & audit logs",
      "On-prem option",
      "SOC 2 report",
    ],
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="bg-dark pt-28 pb-24 px-6">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <SectionLabel text="Pricing" />
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            No hidden fees. No surprises. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex bg-dark-muted rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg border-none text-sm font-semibold cursor-pointer transition-colors ${
                annual ? "bg-primary text-white" : "bg-transparent text-slate-400"
              }`}
            >
              Annual{" "}
              <span className={annual ? "text-green-300" : "text-success"}>
                Save 25%
              </span>
            </button>
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg border-none text-sm font-semibold cursor-pointer transition-colors ${
                !annual ? "bg-primary text-white" : "bg-transparent text-slate-400"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {plans.map((plan) => {
            const price = annual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.name}
                className={
                  plan.featured
                    ? "rounded-2xl p-[3px] bg-gradient-to-br from-primary to-accent"
                    : ""
                }
              >
                <div
                  className={`bg-dark-muted rounded-2xl p-9 ${
                    plan.featured ? "" : "border border-white/5"
                  }`}
                >
                  {plan.featured && (
                    <div className="inline-block bg-primary/20 text-primary-light text-xs font-bold px-2.5 py-1 rounded-md mb-3 uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-white text-xl font-bold mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-slate-500 text-sm mb-5">{plan.desc}</p>

                  <div className="mb-6">
                    {price !== null ? (
                      <span className="text-5xl font-extrabold text-white">
                        ${price}
                        <span className="text-base font-normal text-slate-500">
                          {plan.period}
                        </span>
                      </span>
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        Custom
                      </span>
                    )}
                  </div>

                  <button
                    className={`w-full py-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors mb-7 ${
                      plan.featured
                        ? "bg-primary text-white border-none hover:bg-primary-dark"
                        : "bg-transparent text-white border border-white/15 hover:bg-white/5"
                    }`}
                  >
                    {plan.cta}
                  </button>

                  <div className="flex flex-col gap-3">
                    {plan.features.map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-2.5 text-white/75 text-sm"
                      >
                        <Check size={14} className="text-success" /> {f}
                      </div>
                    ))}
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
