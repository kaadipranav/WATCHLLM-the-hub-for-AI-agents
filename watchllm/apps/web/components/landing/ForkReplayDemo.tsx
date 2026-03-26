"use client";
import { motion, useInView } from "framer-motion";
import { IconGitBranch } from "@tabler/icons-react";
import { useRef } from "react";

export default function ForkReplayDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <div ref={ref} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 16, background: "rgba(255,255,255,0.02)" }}>
      <svg viewBox="0 0 520 260" width="100%" height="260" preserveAspectRatio="xMidYMid meet">
        <motion.path
          d="M260 26 L260 110"
          stroke="#222228"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
        <motion.path
          d="M260 110 C 235 130, 208 145, 188 162"
          stroke="#222228"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
        />
        <motion.path
          d="M260 110 C 287 130, 314 145, 334 162"
          stroke="#00C896"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
        />

        {[26, 68, 110].map((y) => (
          <circle key={y} cx="260" cy={y} r={8} stroke={y === 110 ? "#00C896" : "#1a1a1f"} fill={y === 110 ? "rgba(0,200,150,0.12)" : "#333338"} />
        ))}

        <circle cx="188" cy="162" r="8" stroke="#1a1a1f" fill="#333338" />
        <circle cx="188" cy="204" r="8" stroke="#FF4444" fill="rgba(255,68,68,0.15)" />
        <circle cx="334" cy="162" r="8" stroke="#00C896" fill="rgba(0,200,150,0.15)" />
        <circle cx="334" cy="204" r="8" stroke="#00C896" fill="rgba(0,200,150,0.15)" />

        <text x="156" y="142" style={{ fill: "#666672", fontSize: 12, fontFamily: "var(--font-geist-mono, monospace)" }}>main</text>
        <text x="300" y="142" style={{ fill: "#00C896", fontSize: 12, fontFamily: "var(--font-geist-mono, monospace)" }}>fix/prompt-injection</text>
        <text x="232" y="125" style={{ fill: "#00C896", fontSize: 12, fontFamily: "var(--font-geist-mono, monospace)" }}>fork point</text>
        <text x="170" y="224" style={{ fill: "#FF4444", fontSize: 12, fontFamily: "var(--font-geist-mono, monospace)" }}>FAILED</text>
        <text x="318" y="224" style={{ fill: "#00C896", fontSize: 12, fontFamily: "var(--font-geist-mono, monospace)" }}>PASSED</text>
      </svg>

      <div className="flex items-center gap-2 -mt-3" style={{ color: "#00C896", fontSize: 12, fontFamily: "var(--font-geist-mono, monospace)" }}>
        <IconGitBranch size={14} />
        <span>branch replay from shared execution state</span>
      </div>
    </div>
  );
}
