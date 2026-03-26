"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import AnimatedList from "../reactbits/AnimatedList";

const rows = [
  "✗  prompt_injection    ████████░░  0.82   [CRITICAL]",
  "✓  tool_abuse          ██░░░░░░░░  0.21   [pass]",
  "✗  hallucination       ██████░░░░  0.61   [FAILED]",
  "✓  context_poisoning   █░░░░░░░░░  0.14   [pass]",
  "●  infinite_loop                           [running...]",
  "·  jailbreak                               [queued]",
  "·  data_exfil                              [queued]",
  "·  role_confusion                          [queued]",
];


function CostTicker() {
  const [cost, setCost] = useState(0.0043);
  useEffect(() => {
    const interval = setInterval(() => {
      setCost((c) => {
        const next = c + 0.0001 * Math.random();
        return next > 0.009 ? 0.0043 : next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);
  return <span>${cost.toFixed(4)}</span>;
}

export default function SimulationMockTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
      className="mx-auto w-full"
      style={{
        maxWidth: 680,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        background: "rgba(10,10,14,0.9)",
        boxShadow: "0 0 0 1px rgba(0,200,150,0.08), 0 32px 80px rgba(0,0,0,0.6)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-4"
        style={{ height: 40, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full" style={{ width: 12, height: 12, background: "#FF5F57" }} />
          <span className="rounded-full" style={{ width: 12, height: 12, background: "#FFBD2E" }} />
          <span className="rounded-full" style={{ width: 12, height: 12, background: "#28C840" }} />
        </div>
        <span
          className="flex-1 text-center"
          style={{ fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)", fontSize: 12, color: "#444450" }}
        >
          watchllm simulate --agent my_agent
        </span>
      </div>

      <div style={{ padding: 16, minHeight: 255 }}>
        <AnimatedList
          items={rows}
          showGradients={false}
          displayScrollbar={false}
          enableArrowNavigation={false}
          className="!w-full"
          itemClassName="!p-0 !bg-transparent !rounded-none"
        />

        <div className="absolute inset-x-0" style={{ top: 58, paddingLeft: 30, paddingRight: 30, pointerEvents: "none" }}>
          {rows.map((r, i) => {
            let color = "#333338";
            if (r.startsWith("✗")) color = "#FF4444";
            if (r.startsWith("✓")) color = "#00C896";
            if (r.startsWith("●")) color = "#F59E0B";
            return (
              <div key={r} style={{ height: 30.4, fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)", fontSize: 13, lineHeight: "30.4px", color: "#666672" }}>
                <span style={{ color }}>{r[0]}</span>
                <span>{r.slice(1)}</span>
                {i === 4 && <span style={{ display: "inline-block", width: 8, marginLeft: 3, height: 14, background: "#F59E0B", animation: "blink-cursor 1s steps(2, end) infinite", verticalAlign: "middle" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4"
        style={{
          height: 32,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
          fontSize: 12,
          color: "#444450",
        }}
      >
        <span>2 / 8 categories · severity 0.71 avg</span>
        <CostTicker />
      </div>
    </motion.div>
  );
}
