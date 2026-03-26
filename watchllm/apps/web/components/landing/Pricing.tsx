"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";
import SpotlightCard from "../reactbits/SpotlightCard";

const plans = [
  {
    name: "Developer",
    price: "Free",
    desc: "For solo devs and side projects",
    features: [
      "3 agents",
      "100 simulations / month",
      "Graph replay",
      "Community support",
    ],
    cta: "Get started free",
    href: "/api/v1/auth/signin/github",
    accent: false,
  },
  {
    name: "Team",
    price: "$49",
    period: "/mo",
    desc: "For teams shipping production agents",
    features: [
      "Unlimited agents",
      "5,000 simulations / month",
      "Fork & replay",
      "Behavioral versioning",
      "Priority support",
      "Slack alerts",
    ],
    cta: "Start 14-day trial",
    href: "/api/v1/auth/signin/github",
    accent: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "SOC2, SSO, on-prem — we got you",
    features: [
      "Everything in Team",
      "Unlimited simulations",
      "SSO / SAML",
      "SLA guarantees",
      "Dedicated engineer",
    ],
    cta: "Talk to us",
    href: "mailto:hello@watchllm.dev",
    accent: false,
  },
];

export default function Pricing() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      id="pricing"
      className="flex flex-col items-center px-6"
      style={{
        paddingTop: 100,
        paddingBottom: 100,
        background: "#060608",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4 }}
        style={{
          fontSize: 13,
          color: "#00C896",
          fontWeight: 500,
          letterSpacing: "0.05em",
          fontFamily: "var(--font-geist-mono, monospace)",
        }}
      >
        PRICING
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="text-center mt-4"
        style={{
          fontSize: "clamp(28px, 3vw, 40px)",
          fontWeight: 600,
          color: "#EDEDED",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}
      >
        Simple, transparent pricing
      </motion.h2>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14 w-full"
        style={{ maxWidth: 880 }}
      >
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease: "easeOut" }}
          >
            <SpotlightCard
              className="h-full p-6 flex flex-col"
              spotlightColor={
                plan.accent ? "rgba(0, 200, 150, 0.12)" : "rgba(255,255,255,0.06)"
              }
              style={{
                borderRadius: 10,
                border: plan.accent
                  ? "1px solid rgba(0,200,150,0.25)"
                  : "1px solid rgba(255,255,255,0.06)",
                background: "rgba(10,10,14,0.6)",
              }}
            >
              {/* Badge */}
              {plan.accent && (
                <span
                  className="inline-block self-start mb-3 px-2 py-0.5 rounded-full"
                  style={{
                    fontSize: 11,
                    color: "#00C896",
                    background: "rgba(0,200,150,0.1)",
                    border: "1px solid rgba(0,200,150,0.2)",
                    fontWeight: 600,
                  }}
                >
                  MOST POPULAR
                </span>
              )}

              <h3
                style={{ fontSize: 16, fontWeight: 600, color: "#EDEDED" }}
              >
                {plan.name}
              </h3>
              <p
                style={{ fontSize: 13, color: "#666672", marginTop: 4 }}
              >
                {plan.desc}
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 600,
                    color: "#EDEDED",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span style={{ fontSize: 14, color: "#444450" }}>
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="mt-5 flex flex-col gap-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <IconCheck
                      size={14}
                      style={{ color: "#00C896", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: "#999" }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className="inline-flex items-center justify-center font-medium transition-all duration-150 mt-6 hover:brightness-110"
                style={{
                  height: 38,
                  borderRadius: 7,
                  fontSize: 14,
                  ...(plan.accent
                    ? {
                        background: "#00C896",
                        color: "#060608",
                      }
                    : {
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#EDEDED",
                      }),
                }}
              >
                {plan.cta}
              </Link>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
