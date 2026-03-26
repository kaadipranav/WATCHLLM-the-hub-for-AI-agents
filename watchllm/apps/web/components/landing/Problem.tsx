"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { IconAlertTriangle } from "@tabler/icons-react";

const problems = [
  {
    before: "Eval frameworks test happy paths",
    after: "WatchLLM simulates adversarial scenarios your users will actually hit",
  },
  {
    before: "Logs are flat JSON you grep through at 3am",
    after: "Graph replay traces every tool call, branching decision, and failure mode",
  },
  {
    before: "Version pinning only tells you what model changed",
    after: "Behavioral diffs show you which user flows actually regressed",
  },
];

export default function Problem() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="relative flex flex-col items-center px-6"
      style={{ paddingTop: 100, paddingBottom: 100, background: "#060608" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center gap-2 mb-5"
      >
        <IconAlertTriangle size={16} style={{ color: "#FF4444" }} />
        <span
          style={{
            fontSize: 13,
            color: "#FF4444",
            fontWeight: 500,
            letterSpacing: "0.03em",
            fontFamily: "var(--font-geist-mono, monospace)",
          }}
        >
          THE PROBLEM
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="text-center"
        style={{
          fontSize: "clamp(28px, 3vw, 40px)",
          fontWeight: 600,
          color: "#EDEDED",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          maxWidth: 540,
        }}
      >
        Agents fail silently.
        <br />
        You find out from users.
      </motion.h2>

      <div
        className="mt-14 flex flex-col gap-4 w-full"
        style={{ maxWidth: 700 }}
      >
        {problems.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.12, ease: "easeOut" }}
            className="flex flex-col sm:flex-row"
            style={{
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            {/* Before */}
            <div
              className="flex-1 px-5 py-4"
              style={{ background: "rgba(255,68,68,0.03)" }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "#FF4444",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  fontFamily: "var(--font-geist-mono, monospace)",
                }}
              >
                BEFORE
              </span>
              <p style={{ fontSize: 14, color: "#666672", marginTop: 6, lineHeight: 1.6 }}>
                {p.before}
              </p>
            </div>
            {/* After */}
            <div
              className="flex-1 px-5 py-4"
              style={{
                background: "rgba(0,200,150,0.03)",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "#00C896",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  fontFamily: "var(--font-geist-mono, monospace)",
                }}
              >
                AFTER
              </span>
              <p style={{ fontSize: 14, color: "#EDEDED", marginTop: 6, lineHeight: 1.6 }}>
                {p.after}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
