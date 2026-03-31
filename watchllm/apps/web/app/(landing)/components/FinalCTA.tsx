"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

const words1 = ["Stop", "guessing."];
const words2 = ["Start", "knowing."];

export default function FinalCTA() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-40 px-8 relative text-center" style={{ background: "var(--bg-void)" }}>
      {/* Background glow */}
      <div 
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,229,176,0.04) 0%, transparent 70%)",
          transform: "translate(-50%, -50%)",
          animation: "glow-pulse-bg 6s ease-in-out infinite"
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Line 1 */}
        <div className="mb-4">
          {words1.map((word, i) => (
            <span
              key={`w1-${i}`}
              className="inline-block font-bold"
              style={{
                fontSize: "clamp(40px, 6vw, 80px)",
                lineHeight: 1.1,
                letterSpacing: "-2px",
                color: "var(--text-primary)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(-30px)",
                transition: `all 0.6s ease-out ${i * 0.04}s`
              }}
            >
              {word}{" "}
            </span>
          ))}
        </div>

        {/* Line 2 */}
        <div className="mb-10">
          {words2.map((word, i) => (
            <span
              key={`w2-${i}`}
              className="inline-block font-bold"
              style={{
                fontSize: "clamp(40px, 6vw, 80px)",
                lineHeight: 1.1,
                letterSpacing: "-2px",
                color: "var(--accent-teal)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.6s ease-out ${0.2 + i * 0.04}s`
              }}
            >
              {word}{" "}
            </span>
          ))}
        </div>

        <p className="text-lg mb-10" style={{ color: "var(--text-secondary)" }}>
          Join engineers who ship reliable agents.
        </p>

        <Link
          href="/sign-up"
          className="magnetic inline-block px-14 py-5 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105"
          style={{
            background: "linear-gradient(90deg, #00e5b0, #00b88a, #00e5b0)",
            backgroundSize: "200%",
            color: "#000",
            boxShadow: "var(--glow-teal)",
            animation: "shimmer 3s ease infinite"
          }}
        >
          Start testing free →
        </Link>

        <p className="text-xs font-mono mt-5" style={{ color: "var(--text-muted)" }}>
          No credit card · Any framework · 5 min setup
        </p>
      </div>
    </section>
  );
}
