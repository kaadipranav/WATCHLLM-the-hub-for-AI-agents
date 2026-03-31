"use client";

import HeroCanvas from "./HeroCanvas";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="hero-sentinel" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      <HeroCanvas />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <div 
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
          style={{ 
            borderColor: "rgba(0, 229, 176, 0.3)", 
            background: "rgba(0, 229, 176, 0.06)" 
          }}
        >
          <span 
            className="w-1.5 h-1.5 rounded-full"
            style={{ 
              background: "var(--accent-teal)",
              animation: "pulse-opacity 2s ease-in-out infinite"
            }}
          />
          <span 
            className="text-xs font-mono"
            style={{ color: "var(--accent-teal)" }}
          >
            AGENT RELIABILITY PLATFORM
          </span>
        </div>

        {/* Headline */}
        <h1 
          className="font-bold tracking-tight mb-6"
          style={{ 
            fontSize: "var(--text-hero)",
            lineHeight: 1.1,
            letterSpacing: "-1px",
            color: "var(--text-primary)"
          }}
        >
          <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
            Your agent breaks in prod
          </div>
          <div 
            className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            <span style={{ color: "var(--accent-teal)" }}>WatchLLM</span> shows you{" "}
            <span 
              className="inline-block"
              style={{ animation: mounted ? "glitch-snap 0.6s ease forwards 0.8s" : "none" }}
            >
              why
            </span>
            .
          </div>
        </h1>

        {/* Subtext */}
        <p 
          className={`text-lg md:text-xl max-w-xl mx-auto mb-10 transition-all duration-700 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ color: "var(--text-secondary)" }}
        >
          Stress test with 20+ adversarial scenarios. Replay any run as a graph. Fork from any failure node.
        </p>

        {/* CTA Row */}
        <div 
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 transition-all duration-700 delay-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link 
            href="/sign-up" 
            className="magnetic px-9 py-4 rounded-lg font-bold text-base transition-all duration-200 hover:-translate-y-0.5"
            style={{ 
              background: "var(--accent-teal)", 
              color: "#000",
              boxShadow: "var(--glow-teal)"
            }}
          >
            Start testing free →
          </Link>
          <Link 
            href="/docs" 
            className="magnetic px-9 py-4 rounded-lg font-medium text-base transition-all duration-200"
            style={{ 
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)"
            }}
          >
            Read the docs
          </Link>
        </div>

        {/* Meta */}
        <p 
          className={`text-xs font-mono transition-all duration-700 delay-800 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
          style={{ color: "var(--text-muted)" }}
        >
          No credit card · Any framework · 5 min setup
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-px h-10 relative" style={{ background: "var(--accent-teal)" }}>
          <div 
            className="absolute w-0.5 h-2 rounded-sm left-px"
            style={{ 
              background: "var(--accent-teal)",
              animation: "scroll-dot 1.5s ease-in-out infinite"
            }}
          />
        </div>
        <span 
          className="text-xs font-mono rotate-90 whitespace-nowrap"
          style={{ color: "var(--text-muted)" }}
        >
          scroll
        </span>
      </div>
    </section>
  );
}
