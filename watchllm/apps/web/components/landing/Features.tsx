"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { AttackCategoryGrid } from "./AttackCategoryGrid";
import GraphReplayDemo from "./GraphReplayDemo";
import ForkReplayDemo from "./ForkReplayDemo";

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: "#00C896",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

export default function Features() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      id="features"
      ref={ref}
      style={{ background: "#060608", paddingTop: 80, paddingBottom: 80 }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <span style={sectionLabel}>How WatchLLM Works</span>
        </motion.div>

        {/* ── Feature 1 — Stress Testing ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-[45%_55%] items-center"
          style={{ gap: 64, marginBottom: 96 }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, color: "#333338" }}>01</div>
            <h3 style={{ fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 600, color: "#EDEDED", letterSpacing: "-0.02em", marginTop: 8 }}>
              Break it before users do
            </h3>
            <p style={{ fontSize: 16, color: "#666672", lineHeight: 1.7, maxWidth: 380, marginTop: 16 }}>
              Run 20+ adversarial scenarios against your agent before it ships. Prompt injection. Tool abuse. Hallucination traps.
              Know your failure modes before production finds them.
            </p>
            <Link
              href="/docs"
              style={{ fontSize: 14, color: "#00C896", marginTop: 20, display: "inline-block" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              View all attack categories →
            </Link>
          </div>
          <AttackCategoryGrid />
        </motion.div>

        {/* ── Feature 2 — Graph Replay ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-[55%_45%] items-center"
          style={{ gap: 64, marginBottom: 96 }}
        >
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: 24,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <GraphReplayDemo />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, color: "#333338" }}>02</div>
            <h3 style={{ fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 600, color: "#EDEDED", letterSpacing: "-0.02em", marginTop: 8 }}>
              Rewind to the exact moment it broke
            </h3>
            <p style={{ fontSize: 16, color: "#666672", lineHeight: 1.7, maxWidth: 420, marginTop: 16 }}>
              Every run recorded as an execution graph. Every decision, tool call, and LLM response is a node. Scrub backwards through
              time to find exactly what went wrong. No log grepping. No guessing.
            </p>
          </div>
        </motion.div>

        {/* ── Feature 3 — Fork & Replay ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-[42%_58%] items-center"
          style={{ gap: 64 }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, color: "#333338" }}>03</div>
            <h3 style={{ fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 600, color: "#EDEDED", letterSpacing: "-0.02em", marginTop: 8 }}>
              Fix once. Don&apos;t rerun everything.
            </h3>
            <p style={{ fontSize: 16, color: "#666672", lineHeight: 1.7, maxWidth: 380, marginTop: 16 }}>
              Branch from any node in any run. Apply your fix and replay from exactly that state. No wasted API calls.
              What used to take hours takes minutes.
            </p>
          </div>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: 24,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <ForkReplayDemo />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
