"use client";
import { useEffect, useState } from "react";

import { motion } from "framer-motion";

type RowStatus = "failed" | "passed" | "running" | "queued";

interface TerminalRow {
  category: string;
  status: RowStatus;
  severity?: number;
  score?: string;
  badge: string;
}

const ROWS: TerminalRow[] = [
  { category: "prompt_injection",  status: "failed",  severity: 0.82, score: "0.82", badge: "CRITICAL" },
  { category: "tool_abuse",        status: "passed",  severity: 0.21, score: "0.21", badge: "pass" },
  { category: "hallucination",     status: "failed",  severity: 0.61, score: "0.61", badge: "FAILED" },
  { category: "context_poisoning", status: "passed",  severity: 0.14, score: "0.14", badge: "pass" },
  { category: "infinite_loop",     status: "running", severity: undefined, score: undefined, badge: "running" },
  { category: "jailbreak",         status: "queued",  severity: undefined, score: undefined, badge: "queued" },
  { category: "data_exfil",        status: "queued",  severity: undefined, score: undefined, badge: "queued" },
  { category: "role_confusion",    status: "queued",  severity: undefined, score: undefined, badge: "queued" },
];

const statusIcon = (status: RowStatus) => {
  if (status === "failed")  return { char: "✗", color: "#FF4444" };
  if (status === "passed")  return { char: "✓", color: "#00C896" };
  if (status === "running") return { char: "●", color: "#F59E0B" };
  return { char: "·", color: "#333338" };
};

const categoryColor = (status: RowStatus) => {
  if (status === "failed")  return "#FF4444";
  if (status === "passed")  return "#EDEDED";
  if (status === "running") return "#F59E0B";
  return "#333338";
};

const severityColor = (s: number) => {
  if (s > 0.5) return "#FF4444";
  if (s < 0.3) return "#00C896";
  return "#F59E0B";
};

const badgeStyle = (badge: string): React.CSSProperties => {
  if (badge === "CRITICAL") return { background: "rgba(255,68,68,0.12)", border: "1px solid rgba(255,68,68,0.3)", color: "#FF4444" };
  if (badge === "FAILED")   return { background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.25)", color: "#FF4444" };
  if (badge === "pass")     return { background: "rgba(0,200,150,0.08)", border: "1px solid rgba(0,200,150,0.2)", color: "#00C896" };
  if (badge === "running")  return { background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" };
  return { background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "#333338" };
};

const COST_STEPS = ["$0.0", "$0.00", "$0.001", "$0.001", "$0.0012", "$0.0018", "$0.002", "$0.0027", "$0.003", "$0.0036", "$0.004", "$0.0043"];

export default function SimulationMockTerminal() {
  const [visibleRows, setVisibleRows] = useState(0);
  const [blink, setBlink] = useState(true);
  const [costIdx, setCostIdx] = useState(0);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setVisibleRows(i);
      if (i >= ROWS.length) clearInterval(id);
    }, 300);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCostIdx(prev => {
        if (prev >= COST_STEPS.length - 1) { clearInterval(id); return prev; }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
      style={{
        maxWidth: 700,
        width: "100%",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        overflow: "hidden",
        background: "rgba(8,8,12,0.92)",
        boxShadow: "0 0 0 1px rgba(0,200,150,0.06), 0 24px 60px rgba(0,0,0,0.7), 0 0 80px rgba(0,200,150,0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 38,
          paddingLeft: 16,
          paddingRight: 16,
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {(["#FF5F57", "#FFBD2E", "#28C840"] as const).map((c) => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, color: "#333338" }}>
          watchllm simulate --agent my_agent --categories all
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Body */}
      <div style={{ padding: "16px 20px" }}>
        {ROWS.map((row, i) => {
          if (i >= visibleRows) return null;
          const icon = statusIcon(row.status);
          return (
            <motion.div
              key={row.category}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 3, paddingBottom: 3 }}
            >
              {/* Status icon */}
              <span style={{
                width: 16,
                fontFamily: "var(--font-geist-mono, monospace)",
                fontSize: 13,
                color: icon.color,
                animation: row.status === "running" ? "terminal-blink 1s step-end infinite" : undefined,
              }}>
                {icon.char}
              </span>

              {/* Category name */}
              <span style={{
                width: 152,
                fontFamily: "var(--font-geist-mono, monospace)",
                fontSize: 12,
                color: categoryColor(row.status),
              }}>
                {row.category}
              </span>

              {/* Severity bar */}
              <div style={{ width: 80 }}>
                {row.severity !== undefined && (
                  <div style={{ height: 4, borderRadius: 2, background: "#1a1a1f", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.severity * 100}%` }}
                      transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                      style={{ height: "100%", borderRadius: 2, background: severityColor(row.severity) }}
                    />
                  </div>
                )}
              </div>

              {/* Score */}
              <span style={{
                width: 36,
                fontFamily: "var(--font-geist-mono, monospace)",
                fontSize: 12,
                color: row.status === "failed" ? "#FF4444" : row.status === "passed" ? "#00C896" : "transparent",
              }}>
                {row.score ?? ""}
              </span>

              {/* Badge */}
              <span style={{
                fontFamily: "var(--font-geist-mono, monospace)",
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 9999,
                ...badgeStyle(row.badge),
              }}>
                {row.badge === "running" ? (
                  <>running{blink ? "▋" : " "}</>
                ) : row.badge}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          height: 34,
          paddingLeft: 20,
          paddingRight: 20,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.02)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "#333338" }}>
          4 / 8 categories · avg severity 0.45
        </span>
        <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "#333338" }}>
          {COST_STEPS[costIdx]}
        </span>
      </div>

      <style>{`
        @keyframes terminal-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}
