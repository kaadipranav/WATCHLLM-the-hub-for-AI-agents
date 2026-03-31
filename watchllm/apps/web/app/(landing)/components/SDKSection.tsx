"use client";

import { useEffect, useState, useRef } from "react";

const codeLines = [
  { text: "from watchllm import test", type: "import" },
  { text: "", type: "empty" },
  { text: "@test(", type: "decorator" },
  { text: '    categories=["prompt_injection", "tool_abuse"],', type: "param" },
  { text: '    threshold="severity < 0.3"', type: "param" },
  { text: ")", type: "decorator" },
  { text: "def my_agent(user_input: str) -> str:", type: "def" },
  { text: "    # your existing agent — no changes needed", type: "comment" },
  { text: "    return agent.run(user_input)", type: "return" },
];

const frameworks = ["LangChain", "CrewAI", "AutoGen", "OpenAI", "Anthropic"];

export default function SDKSection() {
  const [visible, setVisible] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setVisible(true);
          // Typewriter effect
          codeLines.forEach((_, i) => {
            setTimeout(() => setVisibleLines(i + 1), i * 150);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  const getLineColor = (type: string) => {
    switch (type) {
      case "import": return "#ff7eb3";
      case "decorator": return "var(--accent-teal)";
      case "param": return "#ffd700";
      case "def": return "#ff7eb3";
      case "comment": return "var(--text-muted)";
      case "return": return "var(--text-primary)";
      default: return "var(--text-primary)";
    }
  };

  return (
    <section 
      ref={ref}
      className="py-36 px-8 relative"
      style={{ background: "var(--bg-surface)" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, var(--bg-void), transparent 20%, transparent 80%, var(--bg-void))" }} />
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative">
        <div>
          <div 
            className="text-xs font-mono tracking-widest mb-4"
            style={{ color: "var(--accent-teal)" }}
          >
            INTEGRATE
          </div>
          <h2 
            className="font-bold mb-5"
            style={{ 
              fontSize: "var(--text-title)",
              lineHeight: 1.1,
              letterSpacing: "-1px",
              color: "var(--text-primary)",
              whiteSpace: "pre-line"
            }}
          >
            Three lines.{`\n`}<span style={{ color: "var(--accent-teal)" }}>Any framework.</span>
          </h2>
          <p className="text-base mb-6" style={{ color: "var(--text-secondary)" }}>
            Works with LangChain, CrewAI, AutoGen, raw OpenAI — anything callable as a Python function. One decorator. Results in 5 minutes.
          </p>
          <div className="flex flex-wrap gap-2">
            {frameworks.map((fw) => (
              <span 
                key={fw}
                className="px-3 py-1.5 rounded border text-xs font-mono"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
              >
                {fw}
              </span>
            ))}
          </div>
        </div>

        <div 
          className="rounded-xl border p-7"
          style={{ background: "#0d0d1a", borderColor: "var(--border-subtle)" }}
        >
          {/* Traffic lights */}
          <div className="flex gap-2 mb-5">
            <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f56" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#27ca40" }} />
          </div>

          {/* Tabs */}
          <div className="flex gap-5 mb-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="pb-3 relative text-xs font-mono" style={{ color: "var(--text-primary)" }}>
              Python
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--accent-teal)" }} />
            </div>
            <div className="pb-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>CLI</div>
          </div>

          {/* Code */}
          <div className="font-mono text-sm leading-relaxed">
            {codeLines.slice(0, visibleLines).map((line, i) => (
              <div key={i} style={{ color: getLineColor(line.type), minHeight: line.type === "empty" ? "1.6em" : "auto" }}>
                {line.text}
                {i === visibleLines - 1 && visibleLines < codeLines.length && (
                  <span 
                    className="inline-block w-0.5 h-4 ml-0.5"
                    style={{ background: "var(--accent-teal)", animation: "blink-cursor 0.8s step-end infinite" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
