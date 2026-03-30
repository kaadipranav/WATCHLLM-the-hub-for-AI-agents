"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { IconCheck, IconMinus } from "@tabler/icons-react";

const FREE_FEATURES: Array<{ text: string; included: boolean }> = [
  { text: "5 simulations / month", included: true },
  { text: "3 attack categories", included: true },
  { text: "CI/CD integration (exit codes)", included: true },
  { text: "7-day run history", included: true },
  { text: "Graph replay", included: false },
  { text: "Fork & replay", included: false },
  { text: "Version history", included: false },
  { text: "Team seats", included: false },
];

const PRO_FEATURES: Array<{ text: string; included: boolean }> = [
  { text: "100 simulations / month", included: true },
  { text: "All 8 attack categories", included: true },
  { text: "Full graph replay", included: true },
  { text: "Fork & replay", included: true },
  { text: "Version history", included: true },
  { text: "90-day history", included: true },
  { text: "1 seat", included: true },
  { text: "Team seats", included: false },
];

const TEAM_FEATURES: Array<{ text: string; included: boolean }> = [
  { text: "500 simulations / month", included: true },
  { text: "Everything in Pro", included: true },
  { text: "10 seats", included: true },
  { text: "365-day history", included: true },
  { text: "Slack notifications", included: true },
  { text: "Priority queue", included: true },
];

function FeatureList({ features }: { features: Array<{ text: string; included: boolean }> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {features.map((f) => (
        <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {f.included
            ? <IconCheck size={14} color="#00C896" />
            : <IconMinus size={14} color="#333338" />
          }
          <span style={{ fontSize: 14, color: f.included ? "#EDEDED" : "#333338" }}>{f.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function Pricing() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      id="pricing"
      ref={ref}
      style={{ paddingTop: 100, paddingBottom: 100, background: "#060608" }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span style={{ fontSize: 11, fontWeight: 500, color: "#00C896", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
              Pricing
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 600, color: "#EDEDED", letterSpacing: "-0.025em", marginTop: 12 }}
          >
            Start free. Pay when it&apos;s worth it.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
            style={{ fontSize: 14, color: "#666672", marginTop: 8 }}
          >
            No credit card required. Cancel anytime.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16, marginTop: 48 }}>
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            style={{
              borderRadius: 10,
              padding: 28,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 500, color: "#666672", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Free</div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 40, fontWeight: 600, color: "#EDEDED", fontFamily: "var(--font-geist-sans, sans-serif)" }}>$0</span>
              <span style={{ fontSize: 16, color: "#666672" }}>/month</span>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />
            <FeatureList features={FREE_FEATURES} />
            <div style={{ marginTop: 24 }}>
              <Link
                href="/sign-up"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 40,
                  borderRadius: 7,
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#EDEDED",
                  fontSize: 14,
                  fontWeight: 500,
                  background: "transparent",
                  transition: "background 150ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Get started free
              </Link>
            </div>
          </motion.div>

          {/* Pro — featured */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
            style={{
              borderRadius: 10,
              padding: 28,
              border: "1px solid rgba(0,200,150,0.25)",
              background: "rgba(0,200,150,0.03)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top glow line */}
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: "60%", height: 1,
              background: "linear-gradient(90deg, transparent, #00C896, transparent)",
            }} />
            {/* Most popular badge */}
            <div style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(0,200,150,0.12)",
              border: "1px solid rgba(0,200,150,0.2)",
              color: "#00C896",
              borderRadius: 9999,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 500,
            }}>
              Most popular
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#666672", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Pro</div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 40, fontWeight: 600, color: "#EDEDED", fontFamily: "var(--font-geist-sans, sans-serif)" }}>$29</span>
              <span style={{ fontSize: 16, color: "#666672" }}>/month</span>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />
            <FeatureList features={PRO_FEATURES} />
            <div style={{ marginTop: 24 }}>
              <form method="POST" action="/api/v1/billing/checkout">
                <input type="hidden" name="tier" value="pro" />
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 7,
                    background: "#00C896",
                    color: "#060608",
                    fontSize: 14,
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                    transition: "filter 150ms ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                >
                  Upgrade to Pro
                </button>
              </form>
            </div>
          </motion.div>

          {/* Team */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.26, ease: "easeOut" }}
            style={{
              borderRadius: 10,
              padding: 28,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 500, color: "#666672", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Team</div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 40, fontWeight: 600, color: "#EDEDED", fontFamily: "var(--font-geist-sans, sans-serif)" }}>$99</span>
              <span style={{ fontSize: 16, color: "#666672" }}>/month</span>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />
            <FeatureList features={TEAM_FEATURES} />
            <div style={{ marginTop: 24 }}>
              <form method="POST" action="/api/v1/billing/checkout">
                <input type="hidden" name="tier" value="team" />
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 7,
                    background: "transparent",
                    border: "1px solid rgba(0,200,150,0.2)",
                    color: "#00C896",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 150ms ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,200,150,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Get Team
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
