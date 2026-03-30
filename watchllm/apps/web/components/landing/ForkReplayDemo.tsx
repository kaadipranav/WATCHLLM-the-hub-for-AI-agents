"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const bezierPath = (x1: number, y1: number, x2: number, y2: number, cx1?: number, cy1?: number, cx2?: number, cy2?: number) => {
  if (cx1 !== undefined) return `M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;
  const cx = (x1 + x2) / 2;
  return `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
};

export default function ForkReplayDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref}>
      <svg width="100%" viewBox="0 0 500 320" style={{ overflow: "visible" }}>
        <defs>
          <marker id="fork-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.1)" />
          </marker>
          <marker id="fork-arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,68,68,0.3)" />
          </marker>
          <marker id="fork-arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(0,200,150,0.3)" />
          </marker>
        </defs>

        {/* === Shared top chain === */}
        {/* N1 agent_start → N2 llm_call */}
        <motion.path
          d={bezierPath(250, 30, 250, 100)}
          stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} fill="none"
          markerEnd="url(#fork-arrow)"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
        />
        {/* N2 → N3 fork point */}
        <motion.path
          d={bezierPath(250, 100, 250, 170)}
          stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} fill="none"
          markerEnd="url(#fork-arrow)"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
        />

        {/* N1 — agent_start */}
        <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.1, duration: 0.3 }}>
          <circle cx={250} cy={30} r={18} fill="#0f0f14" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />
          <text x={250} y={62} textAnchor="middle" style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 10, fill: "#333338" }}>start</text>
        </motion.g>

        {/* N2 — llm_call */}
        <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2, duration: 0.3 }}>
          <circle cx={250} cy={100} r={18} fill="rgba(123,97,255,0.1)" stroke="#7B61FF" strokeWidth={1.5} />
          <text x={250} y={132} textAnchor="middle" style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 10, fill: "#7B61FF" }}>llm_call</text>
        </motion.g>

        {/* N3 — fork point (bigger) */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.3, ease: "easeOut" }}
          style={{ transformOrigin: "250px 170px" }}
        >
          <circle cx={250} cy={170} r={22} fill="rgba(0,200,150,0.12)" stroke="#00C896" strokeWidth={2} />
          <text x={250} y={207} textAnchor="middle" style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 10, fill: "#00C896" }}>fork point</text>
        </motion.g>

        {/* === Left branch (main — failed) === */}
        {/* Branch label */}
        <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.7, duration: 0.3 }}>
          <rect x={90} y={215} width={54} height={18} rx={9} fill="transparent" stroke="rgba(255,255,255,0.1)" />
          <text x={117} y={227} textAnchor="middle" style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 9, fill: "#666672" }}>main</text>
        </motion.g>

        {/* Fork → N4 (left llm_call) */}
        <motion.path
          d={bezierPath(250, 170, 130, 250, 250, 230, 130, 230)}
          stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} fill="none"
          markerEnd="url(#fork-arrow)"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.35, delay: 0.7, ease: "easeOut" }}
        />
        {/* N4 → N5 (failed) */}
        <motion.path
          d={bezierPath(130, 250, 130, 310)}
          stroke="rgba(255,68,68,0.3)" strokeWidth={1.5} fill="none"
          markerEnd="url(#fork-arrow-red)"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.3, delay: 1.0, ease: "easeOut" }}
        />

        {/* N4 llm_call */}
        <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8, duration: 0.3 }}>
          <circle cx={130} cy={250} r={18} fill="rgba(123,97,255,0.1)" stroke="#7B61FF" strokeWidth={1.5} />
        </motion.g>

        {/* N5 FAILED */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.3 }}
          style={{ filter: "drop-shadow(0 0 8px rgba(255,68,68,0.4))" }}
        >
          <circle cx={130} cy={305} r={18} fill="rgba(255,68,68,0.15)" stroke="#FF4444" strokeWidth={2} />
          <text x={130} y={295} textAnchor="middle" style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 9, fill: "#FF4444" }}>FAILED</text>
        </motion.g>

        {/* === Right branch (fix — passed) === */}
        {/* Branch label */}
        <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.0, duration: 0.3 }}>
          <rect x={318} y={212} width={120} height={18} rx={9} fill="rgba(0,200,150,0.06)" stroke="rgba(0,200,150,0.2)" />
          <text x={378} y={224} textAnchor="middle" style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 8.5, fill: "#00C896" }}>fix/prompt-injection</text>
        </motion.g>

        {/* Fork → N6 (right llm_call) */}
        <motion.path
          d={bezierPath(250, 170, 370, 250, 250, 230, 370, 230)}
          stroke="rgba(0,200,150,0.2)" strokeWidth={1.5} fill="none"
          markerEnd="url(#fork-arrow-green)"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.35, delay: 1.0, ease: "easeOut" }}
        />
        {/* N6 → N7 (passed) */}
        <motion.path
          d={bezierPath(370, 250, 370, 310)}
          stroke="rgba(0,200,150,0.3)" strokeWidth={1.5} fill="none"
          markerEnd="url(#fork-arrow-green)"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.3, delay: 1.3, ease: "easeOut" }}
        />

        {/* N6 llm_call */}
        <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.1, duration: 0.3 }}>
          <circle cx={370} cy={250} r={18} fill="rgba(123,97,255,0.1)" stroke="#7B61FF" strokeWidth={1.5} />
        </motion.g>

        {/* N7 PASSED */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1.4, duration: 0.3, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 8px rgba(0,200,150,0.4))", transformOrigin: "370px 305px" }}
        >
          <circle cx={370} cy={305} r={18} fill="rgba(0,200,150,0.15)" stroke="#00C896" strokeWidth={2} />
          <text x={370} y={295} textAnchor="middle" style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 9, fill: "#00C896" }}>PASSED</text>
        </motion.g>
      </svg>
    </div>
  );
}
