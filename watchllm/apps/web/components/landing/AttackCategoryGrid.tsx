"use client";
import { useEffect, useMemo, useState } from "react";

type State = "queued" | "active" | "passed" | "failed";

const items = [
  "prompt_injection",
  "tool_abuse",
  "hallucination",
  "context_poisoning",
  "infinite_loop",
  "jailbreak",
  "data_exfil",
  "role_confusion",
];

const failed = new Set(["prompt_injection", "hallucination", "infinite_loop"]);

function stylesFor(state: State) {
  if (state === "failed") {
    return {
      borderColor: "#FF4444",
      color: "#FF4444",
      background: "rgba(255,68,68,0.06)",
    };
  }
  if (state === "active") {
    return {
      borderColor: "#00C896",
      color: "#EDEDED",
      background: "rgba(0,200,150,0.06)",
    };
  }
  if (state === "passed") {
    return {
      borderColor: "rgba(0,200,150,0.22)",
      color: "#00C896",
      background: "rgba(0,200,150,0.03)",
    };
  }
  return {
    borderColor: "rgba(255,255,255,0.08)",
    color: "#666672",
    background: "transparent",
  };
}

export default function AttackCategoryGrid() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % 3), 4000);
    return () => clearInterval(id);
  }, []);

  const status = useMemo(() => {
    return items.reduce<Record<string, State>>((acc, item, i) => {
      if (failed.has(item)) {
        acc[item] = "failed";
        return acc;
      }
      if (phase === 0) acc[item] = "queued";
      if (phase === 1) acc[item] = i % 2 === 0 ? "active" : "queued";
      if (phase === 2) acc[item] = i % 2 === 0 ? "passed" : "active";
      return acc;
    }, {});
  }, [phase]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <div
          key={item}
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6,
            padding: "8px 14px",
            fontSize: 13,
            fontFamily: "var(--font-geist-mono, monospace)",
            transition: "all 240ms ease-out",
            transitionDelay: `${i * 80}ms`,
            ...stylesFor(status[item]),
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
