"use client";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import AttackCategoryGrid from "@/components/landing/AttackCategoryGrid";
import GraphReplayDemo from "@/components/landing/GraphReplayDemo";
import ForkReplayDemo from "@/components/landing/ForkReplayDemo";

export default function Features() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="features" ref={ref} className="px-6" style={{ background: "#060608", paddingTop: 120, paddingBottom: 40 }}>
      <div className="mx-auto" style={{ maxWidth: 1100 }}>
        <span style={{ fontSize: 11, color: "#00C896", letterSpacing: "0.12em", fontWeight: 500 }}>HOW IT WORKS</span>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-[40%_60%] items-center"
          style={{ gap: 32, paddingTop: 40, paddingBottom: 80 }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#333338", fontFamily: "var(--font-geist-mono, monospace)" }}>01</div>
            <h3 style={{ fontSize: "clamp(28px, 3vw, 32px)", fontWeight: 600, color: "#EDEDED", letterSpacing: "-0.02em", marginTop: 8 }}>
              Break it before users do
            </h3>
            <p style={{ fontSize: 16, color: "#666672", lineHeight: 1.7, maxWidth: 380, marginTop: 16 }}>
              Run 20+ adversarial scenarios against your agent. Prompt injection. Tool abuse. Hallucination traps. Know your
              failure modes before production finds them.
            </p>
            <Link href="/docs" style={{ fontSize: 14, color: "#00C896", marginTop: 14, display: "inline-block" }}>
              See attack categories →
            </Link>
          </div>
          <AttackCategoryGrid />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-[55%_45%] items-center"
          style={{ gap: 32, paddingTop: 10, paddingBottom: 80 }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <GraphReplayDemo />
          <div>
            <div style={{ fontSize: 11, color: "#333338", fontFamily: "var(--font-geist-mono, monospace)" }}>02</div>
            <h3 style={{ fontSize: "clamp(28px, 3vw, 32px)", fontWeight: 600, color: "#EDEDED", letterSpacing: "-0.02em", marginTop: 8 }}>
              Rewind to the exact moment it broke
            </h3>
            <p style={{ fontSize: 16, color: "#666672", lineHeight: 1.7, maxWidth: 420, marginTop: 16 }}>
              Every run recorded as a graph. Every decision node inspectable. Scrub backwards through time to find the exact input
              that caused the failure. No guessing. No log grepping.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-[40%_60%] items-center"
          style={{ gap: 32, paddingTop: 10, paddingBottom: 80 }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#333338", fontFamily: "var(--font-geist-mono, monospace)" }}>03</div>
            <h3 style={{ fontSize: "clamp(28px, 3vw, 32px)", fontWeight: 600, color: "#EDEDED", letterSpacing: "-0.02em", marginTop: 8 }}>
              Fix once. Don&apos;t rerun everything.
            </h3>
            <p style={{ fontSize: 16, color: "#666672", lineHeight: 1.7, maxWidth: 380, marginTop: 16 }}>
              Branch from any node in any run. Apply your fix and replay from exactly that state. Zero wasted API calls. Debug in
              minutes, not hours.
            </p>
          </div>
          <ForkReplayDemo />
        </motion.div>
      </div>
    </section>
  );
}
