"use client";

import { motion } from "motion/react";

const CONTENT = {
  headline: "Simple pricing",
  subheadline: "Start for free, upgrade when you need more.",
  plans: [
    {
      name: "Cap Free",
      price: "$0",
      period: "forever",
      description: "Everything you need to get started with screen recording.",
      features: [
        "Unlimited local recordings",
        "Basic editing tools",
        "Share via link",
        "macOS & Windows apps",
        "Community support",
      ],
      cta: { label: "Free", href: "" },
      highlight: false,
    },
    {
      name: "Cap Pro",
      price: "$50",
      period: "/month",
      description: "For power users and teams who need more.",
      features: [
        "Everything in Free",
        "Unlimited cloud storage",
        "Custom S3 bucket support",
        "AI-powered features",
        "Priority support",
        "Team collaboration",
        "Custom branding",
        "Analytics & insights",
      ],
      cta: { label: "Upgrade to Pro", href: "/pricing" },
      highlight: true,
    },
    {
      name: "Cap Commercial",
      price: "Custom",
      period: "",
      description: "For organizations with specific requirements.",
      features: [
        "Everything in Pro",
        "Self-hosted option",
        "SSO / SAML",
        "Custom contracts",
        "Dedicated support",
        "SLA guarantees",
      ],
      cta: { label: "Contact Sales", href: "/contact" },
      highlight: false,
    },
  ],
} as const;

export default function PricingPage() {
  return (
    <section className="w-full py-12 lg:py-20 flex-1">
      <div className="w-full max-w-[1200px] mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-foreground mb-3">{CONTENT.headline}</h2>
          <p className="text-lg text-muted-foreground">{CONTENT.subheadline}</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CONTENT.plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-2xl shadow-lg border overflow-hidden ${
                plan.highlight
                  ? "text-white"
                  : "text-foreground"
              }`}
              style={{
                background: plan.highlight 
                  ? "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))" 
                  : "oklch(1 0.005 80)",
                borderColor: plan.highlight 
                  ? "transparent" 
                  : "oklch(0.88 0.025 75)",
              }}
            >
              {/* Highlight Background Glow */}
              {plan.highlight && (
                <div 
                  className="absolute -top-20 -right-20 size-64 rounded-full blur-3xl opacity-30 pointer-events-none" 
                  style={{ background: "white" }} 
                />
              )}

              {plan.highlight && (
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest rounded-b-xl">
                  Most Popular
                </div>
              )}

              <div className={`mb-6 ${plan.highlight ? "pt-4" : ""}`}>
                <h3
                  className={`text-xl font-bold mb-2 ${
                    plan.highlight ? "text-white" : "text-foreground/90"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-bold tracking-tight ${
                      plan.highlight ? "text-white" : "text-foreground"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-base font-medium ${
                        plan.highlight ? "text-white/80" : "text-muted-foreground"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-3 text-sm font-medium ${
                    plan.highlight ? "text-white/90" : "text-muted-foreground"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div 
                      className={`flex items-center justify-center rounded-full p-0.5 mt-0.5 flex-shrink-0 ${
                        plan.highlight ? "bg-white/20" : "bg-[oklch(0.5_0.14_145)/15%]"
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 ${
                          plan.highlight ? "text-white" : "text-[oklch(0.5_0.14_145)]"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        plan.highlight ? "text-white" : "text-foreground/80"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.cta.href}
                className={`w-full py-3 px-6 rounded-xl text-center font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md ${
                  plan.highlight
                    ? "bg-white text-[oklch(0.62_0.19_48)] hover:bg-gray-50"
                    : "text-white hover:shadow-lg"
                }`}
                style={!plan.highlight ? {
                  background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))"
                } : {}}
              >
                {plan.cta.label}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
