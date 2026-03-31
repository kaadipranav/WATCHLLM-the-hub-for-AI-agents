"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/components/ToastProvider";
import { apiPost } from "@/lib/api";

const plans = [
  {
    name: "Free",
    price: "$0",
    features: [
      { text: "10 simulations / month", included: true },
      { text: "4 attack categories", included: true },
      { text: "Basic graph replay", included: true },
      { text: "Fork & replay", included: false },
      { text: "Version history", included: false },
      { text: "Diff viewer", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get started free",
    ctaStyle: "ghost",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    badge: "MOST POPULAR",
    features: [
      { text: "Unlimited simulations", included: true },
      { text: "All 8 attack categories", included: true },
      { text: "Full graph replay + scrubbing", included: true },
      { text: "Fork & replay from any node", included: true },
      { text: "Version history + diff viewer", included: true },
      { text: "R2-stored run reports", included: true },
      { text: "Team seats", included: false },
      { text: "SSO / audit logs", included: false },
    ],
    cta: "Start Pro free →",
    ctaStyle: "primary",
    featured: true,
  },
  {
    name: "Team",
    price: "$99",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "5 team seats", included: true },
      { text: "Shared simulation history", included: true },
      { text: "SSO (coming soon)", included: true, note: true },
      { text: "Audit logs", included: true },
      { text: "Priority support", included: true },
      { text: "SLA guarantee", included: true },
    ],
    cta: "Contact us",
    ctaStyle: "ghost",
    featured: false,
  },
];

export default function PricingSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pushError } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const checkout = async (tier: "pro" | "team") => {
    try {
      const payload = await apiPost<{ checkout_url: string }>("/api/v1/billing/checkout", { tier });
      window.location.href = payload.checkout_url;
    } catch (error) {
      pushError(error instanceof Error ? error.message : "Unable to open checkout");
    }
  };

  return (
    <section id="pricing" ref={ref} className="py-36 px-8" style={{ background: "var(--bg-void)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div 
            className="text-xs font-mono tracking-widest mb-4"
            style={{ color: "var(--accent-teal)" }}
          >
            PRICING
          </div>
          <h2 
            className="font-bold mb-4"
            style={{ 
              fontSize: "var(--text-display)",
              lineHeight: 1,
              letterSpacing: "-2px",
              color: "var(--text-primary)",
              whiteSpace: "pre-line"
            }}
          >
            Simple pricing.{`\n`}No surprises.
          </h2>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            Start free. Upgrade when you ship.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-10 border transition-all duration-600 ${
                plan.featured ? "md:-translate-y-3" : ""
              }`}
              style={{
                background: plan.featured 
                  ? "linear-gradient(135deg, var(--bg-elevated), rgba(0,229,176,0.04))"
                  : "var(--bg-surface)",
                borderColor: plan.featured ? "rgba(0,229,176,0.4)" : "var(--border-subtle)",
                boxShadow: plan.featured ? "var(--glow-teal)" : "none",
                opacity: visible ? 1 : 0,
                transform: visible 
                  ? plan.featured ? "translateY(-12px)" : "translateY(0)" 
                  : "translateY(40px)",
                transitionDelay: `${i * 150}ms`,
              }}
            >
              {plan.badge && (
                <div 
                  className="text-xs font-mono tracking-widest text-center mb-3"
                  style={{ color: "var(--accent-teal)" }}
                >
                  {plan.badge}
                </div>
              )}
              
              <div 
                className="text-xs font-mono mb-2"
                style={{ color: plan.featured ? "var(--accent-teal)" : "var(--text-muted)" }}
              >
                {plan.name}
              </div>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span 
                  className="font-bold"
                  style={{ fontSize: "52px", color: "var(--text-primary)", lineHeight: 1 }}
                >
                  {plan.price}
                </span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>/month</span>
              </div>

              <div className="h-px mb-6" style={{ background: "var(--border-subtle)" }} />

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li 
                    key={feature.text}
                    className={`flex items-center gap-3 text-sm ${!feature.included ? "line-through" : ""}`}
                    style={{ color: feature.included ? "var(--text-secondary)" : "var(--text-muted)" }}
                  >
                    {feature.included ? (
                      <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" style={{ color: "var(--accent-teal)" }}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" style={{ color: "var(--accent-amber)" }}>
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    )}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>

              {plan.name === "Pro" ? (
                <button
                  onClick={() => checkout("pro")}
                  className="magnetic w-full py-3.5 rounded-lg font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "var(--accent-teal)", color: "#000" }}
                >
                  {plan.cta}
                </button>
              ) : plan.name === "Team" ? (
                <button
                  onClick={() => checkout("team")}
                  className="magnetic w-full py-3.5 rounded-lg text-sm transition-all duration-200"
                  style={{ 
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)"
                  }}
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  href="/sign-up"
                  className="magnetic block w-full py-3.5 rounded-lg text-center text-sm transition-all duration-200"
                  style={{ 
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)"
                  }}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "var(--text-muted)" }}>
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
