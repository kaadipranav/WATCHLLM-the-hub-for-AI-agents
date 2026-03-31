"use client";

import { useEffect, useState, useRef } from "react";

const frameworks = ["LangChain", "CrewAI", "AutoGen", "OpenAI SDK", "Anthropic SDK"];

export default function FrameworkStrip() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-6 border-y"
      style={{ 
        borderColor: "var(--border-subtle)",
        background: "var(--bg-void)"
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-center flex-wrap gap-4">
          <span 
            className="text-xs font-mono mr-6"
            style={{ color: "var(--text-muted)" }}
          >
            Works with
          </span>
          <div className="flex items-center flex-wrap gap-3">
            {frameworks.map((fw, i) => (
              <span key={fw} className="flex items-center gap-3">
                <span
                  className="text-sm transition-all duration-400"
                  style={{
                    color: "var(--text-secondary)",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-10px)",
                    transitionDelay: `${i * 80}ms`
                  }}
                >
                  {fw}
                </span>
                {i < frameworks.length - 1 && (
                  <span 
                    className="w-px h-4"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
