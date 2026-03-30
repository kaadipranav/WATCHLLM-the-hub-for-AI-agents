"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const NODES = [
  { id: "N1", x: 60,  y: 140, type: "start",    label: "start",     labelColor: "#333338" },
  { id: "N2", x: 160, y: 80,  type: "llm",       label: "llm_call",  labelColor: "#7B61FF" },
  { id: "N3", x: 160, y: 200, type: "tool",      label: "tool_call", labelColor: "#00C896" },
  { id: "N4", x: 280, y: 80,  type: "llm",       label: "llm_call",  labelColor: "#7B61FF" },
  { id: "N5", x: 280, y: 200, type: "tool",      label: "tool_call", labelColor: "#00C896" },
  { id: "N6", x: 380, y: 140, type: "failure",   label: "FAILED",    labelColor: "#FF4444" },
  { id: "N7", x: 460, y: 140, type: "end",       label: "end",       labelColor: "#333338" },
];

const EDGES = [
  { from: 0, to: 1 }, { from: 0, to: 2 },
  { from: 1, to: 3 }, { from: 2, to: 4 },
  { from: 3, to: 5 }, { from: 4, to: 5 },
  { from: 5, to: 6 },
];

const LATENCIES = [0, 234, 891, 445, 1203, 847, 12];

const nodeStyle = (type: string) => {
  if (type === "llm")     return { fill: "rgba(123,97,255,0.1)", stroke: "#7B61FF", strokeWidth: 1.5, filter: "" };
  if (type === "tool")    return { fill: "rgba(0,200,150,0.1)", stroke: "#00C896", strokeWidth: 1.5, filter: "" };
  if (type === "failure") return { fill: "rgba(255,68,68,0.15)", stroke: "#FF4444", strokeWidth: 2, filter: "drop-shadow(0 0 8px rgba(255,68,68,0.4))" };
  return { fill: "#0f0f14", stroke: "rgba(255,255,255,0.12)", strokeWidth: 1.5, filter: "" };
};

const bezierPath = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = (x1 + x2) / 2;
  return `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
};

export default function GraphReplayDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [scrubber, setScrubber] = useState(30);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const nodeIndex = Math.floor((scrubber / 100) * (NODES.length - 1));
  const currentNode = NODES[nodeIndex];

  const handleMouseDown = () => setDragging(true);
  const handleMouseUp = () => setDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setScrubber(pct);
  };

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <svg
        width="100%"
        viewBox="0 0 500 280"
        style={{ overflow: "visible" }}
      >
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.1)" />
          </marker>
          <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,68,68,0.3)" />
          </marker>
        </defs>

        {/* Edges */}
        {EDGES.map((edge, i) => {
          const from = NODES[edge.from];
          const to = NODES[edge.to];
          const isFailEdge = to.type === "failure" || from.type === "failure";
          return (
            <motion.path
              key={i}
              d={bezierPath(from.x, from.y, to.x, to.y)}
              stroke={isFailEdge ? "rgba(255,68,68,0.3)" : "rgba(255,255,255,0.1)"}
              strokeWidth={1.5}
              fill="none"
              markerEnd={isFailEdge ? "url(#arrow-red)" : "url(#arrow)"}
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.3, delay: i * 0.1, ease: "easeOut" }}
            />
          );
        })}

        {/* Nodes */}
        {NODES.map((node, i) => {
          const style = nodeStyle(node.type);
          const afterCurrent = i > nodeIndex;
          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: afterCurrent ? 0.2 : 1 } : { opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.12 }}
              style={{ filter: style.filter || undefined }}
            >
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={18}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                animate={i === nodeIndex ? { scale: 1.08 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              />
              <text
                x={node.x}
                y={node.y + 32}
                textAnchor="middle"
                style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 10, fill: node.labelColor }}
              >
                {node.label}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Scrubber */}
      <div style={{ marginTop: 16, paddingLeft: 24, paddingRight: 24 }}>
        <div
          ref={trackRef}
          style={{ height: 3, borderRadius: 9999, background: "rgba(255,255,255,0.08)", position: "relative", cursor: "pointer" }}
          onClick={(e) => {
            if (!trackRef.current) return;
            const rect = trackRef.current.getBoundingClientRect();
            setScrubber(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
          }}
        >
          <div
            style={{
              height: 3,
              borderRadius: 9999,
              background: "#00C896",
              width: `${scrubber}%`,
              transition: dragging ? "none" : "width 150ms ease",
            }}
          />
          <div
            onMouseDown={handleMouseDown}
            style={{
              position: "absolute",
              top: -5.5,
              left: `calc(${scrubber}% - 7px)`,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#00C896",
              cursor: "grab",
              boxShadow: "0 0 0 3px rgba(0,200,150,0.15)",
              transition: dragging ? "none" : "left 150ms ease",
            }}
          />
        </div>
        <div style={{ marginTop: 10, fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "#444450" }}>
          Node {nodeIndex + 1} of {NODES.length} · {currentNode.label} · {LATENCIES[nodeIndex]}ms
        </div>
      </div>
    </div>
  );
}
