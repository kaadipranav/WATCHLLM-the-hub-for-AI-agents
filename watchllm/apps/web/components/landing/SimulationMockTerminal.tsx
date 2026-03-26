"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

type RowStatus = "critical" | "failed" | "pass" | "running" | "queued";

interface SimRow {
  icon: string;
  category: string;
  bars: string | null;
  score: string | null;
  badge: string;
  status: RowStatus;
}

const rows: SimRow[] = [
  { icon: "✗", category: "prompt_injection", bars: "████████░░", score: "0.82", badge: "CRITICAL", status: "critical" },
  { icon: "✓", category: "tool_abuse", bars: "██░░░░░░░░", score: "0.21", badge: "pass", status: "pass" },
  { icon: "✗", category: "hallucination", bars: "██████░░░░", score: "0.61", badge: "FAILED", status: "failed" },
  { icon: "✓", category: "context_poisoning", bars: "█░░░░░░░░░", score: "0.14", badge: "pass", status: "pass" },
  { icon: "●", category: "infinite_loop", bars: null, score: null, badge: "running...", status: "running" },
  { icon: "·", category: "jailbreak", bars: null, score: null, badge: "queued", status: "queued" },
  { icon: "·", category: "data_exfil", bars: null, score: null, badge: "queued", status: "queued" },
  { icon: "·", category: "role_confusion", bars: null, score: null, badge: "queued", status: "queued" },
];

const statusColor: Record<RowStatus, string> = {
  critical: "#FF4444",
  failed: "#FF4444",
  pass: "#00C896",
  running: "#F59E0B",
  queued: "#333338",
};

const badgeBg: Record<RowStatus, string> = {
  critical: "rgba(255,68,68,0.12)",
  failed: "rgba(255,68,68,0.12)",
  pass: "rgba(0,200,150,0.1)",
  running: "rgba(245,158,11,0.1)",
  queued: "rgba(51,51,56,0.2)",
};

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
  const [visibleRows, setVisibleRows] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setVisibleRows(i);
      if (i >= rows.length) clearInterval(interval);
    }, 350);
    return () => clearInterval(interval);
  }, [inView]);

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

      {/* Body */}
      <div style={{ padding: 16, minHeight: 220 }}>
        {rows.map((row, idx) => (
          <div
            key={row.category}
            className="flex items-center gap-3"
            style={{
              fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
              fontSize: 13,
              lineHeight: "1.8",
              opacity: idx < visibleRows ? 1 : 0,
              transform: idx < visibleRows ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            <span style={{ color: statusColor[row.status], width: 16, textAlign: "center" }}>
              {row.status === "running" ? (
                <span className="inline-block animate-pulse">{row.icon}</span>
              ) : (
                row.icon
              )}
            </span>
            <span style={{ color: "#EDEDED", width: 160, whiteSpace: "nowrap" }}>
              {row.category}
            </span>
            {row.bars ? (
              <>
                <span style={{ color: row.status === "pass" ? "#00C896" : "#FF4444", letterSpacing: 1 }}>
                  {row.bars.split("").map((char, ci) => (
                    <span key={ci} style={{ color: char === "░" ? "#1a1a1f" : undefined }}>
                      {char}
                    </span>
                  ))}
                </span>
                <span style={{ color: "#666672", width: 36, textAlign: "right" }}>{row.score}</span>
              </>
            ) : (
              <span style={{ flex: 1 }} />
            )}
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full"
              style={{
                fontSize: 11,
                color: statusColor[row.status],
                background: badgeBg[row.status],
                border: `1px solid ${statusColor[row.status]}20`,
              }}
            >
              {row.badge}
              {row.status === "running" && (
                <span className="ml-1 inline-block w-1 h-3 animate-pulse" style={{ background: "#F59E0B" }} />
              )}
            </span>
          </div>
        ))}
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
