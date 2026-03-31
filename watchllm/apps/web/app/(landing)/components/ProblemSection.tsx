"use client";

import { useEffect, useState, useRef } from "react";

const problems = [
  {
    title: "Agents fail silently",
    description: "You find out when a user reports it. By then, the damage is done.",
    icon: "alert",
  },
  {
    title: "Logs don't replay",
    description: "You see the crash. You can't rewind to what caused it.",
    icon: "clock",
  },
  {
    title: "Debugging burns credits",
    description: "Every debug attempt reruns the full agent. Costs stack up fast.",
    icon: "coins",
  },
];

export default function ProblemSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={ref}
      className="py-36 px-8"
      style={{ background: "var(--bg-void)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div 
          className="text-xs font-mono tracking-widest mb-6"
          style={{ color: "var(--accent-teal)" }}
        >
          THE PROBLEM
        </div>
        
        <h2 
          className="font-bold mb-16 max-w-2xl"
          style={{ 
            fontSize: "var(--text-display)",
            lineHeight: 1,
            letterSpacing: "-2px",
            color: "var(--text-primary)",
            whiteSpace: "pre-line"
          }}
        >
          Agents work in dev.{`\n`}Production is different.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {problems.map((problem, i) => (
            <div
              key={problem.title}
              className="p-9 rounded-xl border transition-all duration-250 group cursor-pointer"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                transform: visible ? "translateY(0)" : "translateY(60px)",
                opacity: visible ? 1 : 0,
                transitionDelay: `${i * 150}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 107, 53, 0.3)";
                e.currentTarget.style.boxShadow = "var(--glow-failure)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div className="w-12 h-12 mb-5 relative">
                {problem.icon === "alert" && (
                  <>
                    <div 
                      className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full border"
                      style={{
                        borderColor: "var(--accent-amber)",
                        animation: "alert-ping 2s ease-out infinite",
                        transform: "translate(-50%, -50%)"
                      }}
                    />
                    <svg viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent-amber)" }}>
                      <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </>
                )}
                {problem.icon === "clock" && (
                  <svg viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-secondary)" }}>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                    <g className="group-hover:animate-spin" style={{ transformOrigin: "12px 12px" }}>
                      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5"/>
                    </g>
                    <path d="M4 4l16 16" stroke="var(--accent-amber)" strokeWidth="1.5"/>
                  </svg>
                )}
                {problem.icon === "coins" && (
                  <svg viewBox="0 0 24 24" fill="none">
                    <ellipse cx="12" cy="16" rx="6" ry="3" stroke="var(--text-muted)" strokeWidth="1.5"/>
                    <ellipse cx="12" cy="12" rx="6" ry="3" stroke="var(--text-muted)" strokeWidth="1.5"/>
                    <ellipse cx="12" cy="8" rx="6" ry="3" stroke="var(--text-muted)" strokeWidth="1.5"/>
                    <g className="group-hover:opacity-100 opacity-80">
                      <path d="M12 20c-2-1-2-3-1-5 1-2 2-3 1-5" stroke="var(--accent-amber)" strokeWidth="1.5" fill="none"/>
                    </g>
                  </svg>
                )}
              </div>
              
              <h3 
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {problem.title}
              </h3>
              
              <p 
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
