"use client";

import { useMemo, useState } from "react";

type GraphNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  step: number;
  tone: "llm" | "tool" | "failure";
};

export default function GraphReplayVisual() {
  const [cursor, setCursor] = useState(4);

  const nodes = useMemo<GraphNode[]>(
    () => [
      { id: "n1", x: 40, y: 90, label: "start", step: 1, tone: "tool" },
      { id: "n2", x: 120, y: 45, label: "llm_call", step: 2, tone: "llm" },
      { id: "n3", x: 200, y: 90, label: "tool_call", step: 3, tone: "tool" },
      { id: "n4", x: 280, y: 45, label: "llm_call", step: 4, tone: "llm" },
      { id: "n5", x: 360, y: 95, label: "failure", step: 5, tone: "failure" },
    ],
    [],
  );

  const tone = (n: GraphNode) => {
    if (n.tone === "failure") return "#ff4f5e";
    if (n.tone === "llm") return "#8b5cf6";
    return "#00C896";
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e0e0e] p-5">
      <svg viewBox="0 0 400 140" className="h-40 w-full">
        {nodes.slice(0, -1).map((node, index) => {
          const next = nodes[index + 1];
          return (
            <line
              key={`${node.id}_${next.id}`}
              x1={node.x}
              y1={node.y}
              x2={next.x}
              y2={next.y}
              stroke={node.step <= cursor ? "#6b7280" : "#374151"}
              strokeWidth="2"
            />
          );
        })}
        {nodes.map((node) => (
          <g key={node.id} opacity={node.step <= cursor ? 1 : 0.2}>
            <circle cx={node.x} cy={node.y} r="12" fill={tone(node)} />
            <text x={node.x - 20} y={node.y + 30} fill="#d1d5db" fontSize="10" className="font-mono">
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <input
        type="range"
        min={1}
        max={5}
        value={cursor}
        onChange={(event) => setCursor(Number(event.target.value))}
        className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10"
      />
    </div>
  );
}
