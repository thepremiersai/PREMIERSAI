import { useState } from "react";
import { PricingPlan, PlanId } from "../types";
import { Check, Sparkles, Zap, Shield, Crown } from "lucide-react";

interface PricingSectionProps {
  currentPlan: PlanId;
  onSelectPlan: (plan: PricingPlan, billingPeriod: "monthly" | "yearly") => void;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "Basic multilingual AI chat in 100+ languages",
      "5 vision image analyses per month",
      "3 real-time web searches",
      "Basic code syntax generation",
      "Standard community response speed",
      "Single-session chat persistence",
      "Unicode & RTL text rendering",
    ],
    limits: {
      messages: 50,
      images: 5,
      searches: 3,
      projects: 1,
    },
  },
  {
    id: "standard",
    name: "Standard",
    priceMonthly: 19,
    priceYearly: 182, // ~20% discount
    popular: true,
    features: [
      "Everything in Free plan",
      "50 high-res AI image & logo generations",
      "Unlimited real-time web searches & sources",
      "Full interactive website sandboxing & live preview",
      "10 saved projects and unlimited chat history",
      "YouTube thumbnail generator (1280x720)",
      "Priority Gemini 3.8 Flash model processing",
      "Export code & high-res SVG/PNG assets",
    ],
    limits: {
      messages: 500,
      images: 50,
      searches: Infinity,
      projects: 10,
    },
  },
  {
    id: "premium",
    name: "Premium",
    priceMonthly: 49,
    priceYearly: 470, // ~20% discount
    features: [
      "Everything in Standard plan",
      "Unlimited AI image, logo, and thumbnail creation",
      "Unlimited multimodal vision & OCR document parsing",
      "Unlimited projects and saved workspaces",
      "Advanced deep strategic research reports",
      "Ultra-low latency dedicated response lane",
      "Custom brand typography & vector guidelines",
      "Dedicated 24/7 AI studio engineering support",
    ],
    limits: {
      messages: Infinity,
      images: Infinity,
      searches: Infinity,
      projects: Infinity,
    },
  },
];

export function PricingSection({ currentPlan, onSelectPlan }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" className="py-16 md:py-24 border-t border-[#1e1e2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-[#00d4a0] mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Plans</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Choose Your <span className="text-[#00d4a0]">Plan</span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Simple, honest pricing with no hidden charges. All plans include global multilingual support, vision intelligence, and card scrolling protections.
          </p>

          {/* Billing Period Toggle */}
          <div className="mt-8 inline-flex items-center gap-2 p-1 rounded-xl border border-[#2b2b3e] bg-[#141420]">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[38px] ${
                billingPeriod === "monthly"
                  ? "bg-[#00d4a0] text-black shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[38px] flex items-center gap-1.5 ${
                billingPeriod === "yearly"
                  ? "bg-[#00d4a0] text-black shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>Yearly Billing</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-black font-extrabold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PRICING_PLANS.map((plan) => {
            const price = billingPeriod === "monthly" ? plan.priceMonthly : plan.priceYearly;
            const periodLabel = billingPeriod === "monthly" ? "/mo" : "/yr";
            const isCurrent = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.popular
                    ? "bg-gradient-to-b from-[#151c27] to-[#10121a] border-[#00d4a0] shadow-xl shadow-[#00d4a0]/10 scale-[1.02]"
                    : "bg-[#12121c] border-[#242436] hover:border-[#00d4a0]/40"
                }`}
              >
                {/* Popular Ribbon */}
                {plan.popular && (
                  <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-[#00d4a0] text-black text-xs font-bold shadow-md uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {plan.id === "free" && <Zap className="w-5 h-5 text-gray-400" />}
                    {plan.id === "standard" && <Sparkles className="w-5 h-5 text-[#00d4a0]" />}
                    {plan.id === "premium" && <Crown className="w-5 h-5 text-amber-400" />}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-4xl font-extrabold text-white">${price}</span>
                    <span className="text-sm text-gray-400 font-medium">{periodLabel}</span>
                  </div>

                  {/* Current Plan Badge */}
                  {isCurrent && (
                    <div className="mb-4 px-3 py-1 rounded-lg bg-[#00d4a0]/15 text-[#00d4a0] text-xs font-bold inline-block border border-[#00d4a0]/30">
                      ✓ Active Plan
                    </div>
                  )}

                  {/* Card Scrolling Safe Feature List */}
                  <div className="card-scroll border-t border-[#1e1e2e] pt-4 mb-6 space-y-2.5 max-h-56">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                        <Check className="w-4 h-4 text-[#00d4a0] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checkout / Select Button */}
                <button
                  onClick={() => onSelectPlan(plan, billingPeriod)}
                  disabled={isCurrent}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                    isCurrent
                      ? "bg-[#1c1c2b] text-gray-400 border border-[#2b2b3e] cursor-default"
                      : plan.popular
                      ? "bg-[#00d4a0] hover:bg-[#00e8b0] text-black shadow-lg shadow-[#00d4a0]/30 btn-shimmer-neon btn-glow-pulse"
                      : "border border-[#2e2e44] bg-[#161622] hover:bg-[#1f1f30] text-white btn-glow-pulse"
                  }`}
                >
                  {isCurrent ? "Current Plan" : `Select ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
