"use client";
import { useMemo, useState } from "react";

type NodeType = "agent_start" | "llm_call" | "tool_call" | "failure" | "agent_end";

type Node = {
  id: number;
  x: number;
  y: number;
  type: NodeType;
  label: string;
  ms: number;
  cost: string;
};

const nodes: Node[] = [
  { id: 1, x: 24, y: 58, type: "agent_start", label: "agent_start", ms: 0, cost: "$0.0000" },
  { id: 2, x: 90, y: 30, type: "llm_call", label: "llm_call", ms: 322, cost: "$0.0005" },
  { id: 3, x: 162, y: 52, type: "tool_call", label: "tool_call", ms: 612, cost: "$0.0010" },
  { id: 4, x: 228, y: 24, type: "tool_call", label: "tool_call", ms: 847, cost: "$0.0012" },
  { id: 5, x: 300, y: 54, type: "llm_call", label: "llm_call", ms: 1140, cost: "$0.0018" },
  { id: 6, x: 370, y: 30, type: "failure", label: "FAILURE", ms: 1320, cost: "$0.0021" },
  { id: 7, x: 438, y: 58, type: "agent_end", label: "agent_end", ms: 1452, cost: "$0.0021" },
];

function nodeStyle(type: NodeType) {
  if (type === "llm_call") return { border: "#7B61FF", fill: "rgba(123,97,255,0.2)" };
  if (type === "tool_call") return { border: "#00C896", fill: "rgba(0,200,150,0.2)" };
  if (type === "failure") return { border: "#FF4444", fill: "rgba(255,68,68,0.15)" };
  return { border: "#1a1a1f", fill: "#333338" };
}

export default function GraphReplayDemo() {
  const [value, setValue] = useState(50);
  const index = useMemo(() => Math.max(1, Math.min(nodes.length, Math.round((value / 100) * nodes.length))), [value]);

  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 16, background: "rgba(255,255,255,0.02)" }}>
      <svg viewBox="0 0 460 94" width="100%" height="180" preserveAspectRatio="xMidYMid meet">
        {nodes.slice(0, -1).map((node, i) => {
          const next = nodes[i + 1];
          const active = next.id <= index;
          const isFailureEdge = next.type === "failure";
          return (
            <path
              key={`${node.id}-${next.id}`}
              d={`M ${node.x} ${node.y} C ${(node.x + next.x) / 2} ${node.y - 20}, ${(node.x + next.x) / 2} ${next.y + 20}, ${next.x} ${next.y}`}
              fill="none"
              stroke={isFailureEdge ? "#FF4444" : "#222228"}
              strokeWidth="1.5"
              opacity={active ? (isFailureEdge ? 0.4 : 1) : 0.2}
            />
          );
        })}

        {nodes.map((n) => {
          const state = nodeStyle(n.type);
          const active = n.id <= index;
          return (
            <g key={n.id} opacity={active ? 1 : 0.2}>
              <circle cx={n.x} cy={n.y} r={8} stroke={state.border} fill={state.fill} />
              {n.type === "failure" && <circle cx={n.x} cy={n.y} r={12} fill="none" stroke="#FF4444" opacity={0.3} />}
              <text x={n.x} y={n.y + 19} textAnchor="middle" style={{ fill: "#444450", fontSize: 12, fontFamily: "var(--font-geist-mono, monospace)" }}>
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ marginTop: 14 }}>
        <div style={{ height: 2, background: "#1a1a1f", position: "relative" }}>
          <div style={{ height: 2, width: `${value}%`, background: "#00C896" }} />
          <div style={{ position: "absolute", left: `calc(${value}% - 6px)`, top: -5, width: 12, height: 12, borderRadius: 9999, background: "#00C896" }} />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          style={{ width: "100%", opacity: 0, marginTop: -14, height: 20, cursor: "pointer" }}
          aria-label="timeline scrubber"
        />
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: "#444450", fontFamily: "var(--font-geist-mono, monospace)" }}>
        Node {index} of 7 · {nodes[index - 1].type === "failure" ? "FAILURE" : nodes[index - 1].label} · {nodes[index - 1].ms}ms · {nodes[index - 1].cost}
      </div>
    </div>
  );
}
