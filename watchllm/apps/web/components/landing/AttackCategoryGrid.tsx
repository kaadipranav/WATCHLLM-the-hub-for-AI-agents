"use client";
import { useEffect, useRef, useState } from "react";


type PillState = "queued" | "scanning" | "passed" | "failed";

const CATEGORIES = [
  { id: "prompt_injection", alwaysFails: true },
  { id: "tool_abuse", alwaysFails: false },
  { id: "hallucination", alwaysFails: true },
  { id: "context_poisoning", alwaysFails: false },
  { id: "infinite_loop", alwaysFails: true },
  { id: "jailbreak", alwaysFails: false },
  { id: "data_exfiltration", alwaysFails: false },
  { id: "role_confusion", alwaysFails: false },
];

const pillStyle = (state: PillState): React.CSSProperties => {
  const base: React.CSSProperties = {
    borderRadius: 6,
    padding: "8px 14px",
    fontFamily: "var(--font-geist-mono, monospace)",
    fontSize: 12,
    border: "1px solid",
    transition: "all 300ms ease",
    display: "inline-block",
    whiteSpace: "nowrap",
  };
  if (state === "queued")   return { ...base, background: "transparent", borderColor: "rgba(255,255,255,0.07)", color: "#333338" };
  if (state === "scanning") return { ...base, background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.2)", color: "#F59E0B" };
  if (state === "passed")   return { ...base, background: "rgba(0,200,150,0.06)", borderColor: "rgba(0,200,150,0.2)", color: "#00C896" };
  return                           { ...base, background: "rgba(255,68,68,0.06)", borderColor: "rgba(255,68,68,0.25)", color: "#FF4444" };
};

export function AttackCategoryGrid() {
  const [states, setStates] = useState<PillState[]>(CATEGORIES.map(() => "queued"));
  const currentRef = useRef(0);
  const phaseRef = useRef<"scanning" | "result">("scanning");

  useEffect(() => {
    const tick = () => {
      const idx = currentRef.current;
      if (idx >= CATEGORIES.length) {
        // Reset after 2s pause
        setTimeout(() => {
          setStates(CATEGORIES.map(() => "queued"));
          currentRef.current = 0;
          phaseRef.current = "scanning";
        }, 2000);
        return;
      }

      if (phaseRef.current === "scanning") {
        setStates(prev => { const n = [...prev]; n[idx] = "scanning"; return n; });
        phaseRef.current = "result";
        setTimeout(tick, 500);
      } else {
        const result: PillState = CATEGORIES[idx].alwaysFails ? "failed" : "passed";
        setStates(prev => { const n = [...prev]; n[idx] = result; return n; });
        currentRef.current = idx + 1;
        phaseRef.current = "scanning";
        setTimeout(tick, 500);
      }
    };

    const id = setTimeout(tick, 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {CATEGORIES.map((cat, i) => (
        <div key={cat.id} style={pillStyle(states[i])}>
          {cat.id}
        </div>
      ))}
    </div>
  );
}
