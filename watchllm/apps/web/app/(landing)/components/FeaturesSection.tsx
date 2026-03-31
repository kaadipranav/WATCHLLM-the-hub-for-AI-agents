"use client";

import { useEffect, useState, useRef } from "react";

const attackScenarios = [
  "prompt_injection", "tool_abuse", "hallucination", "context_poisoning",
  "infinite_loop", "jailbreak", "data_exfiltration", "role_confusion"
];

export default function FeaturesSection() {
  const [stepVisible, setStepVisible] = useState([false, false, false]);
  const stepRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const observers = stepRefs.map((ref, i) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setStepVisible(prev => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }
        },
        { threshold: 0.2 }
      );
      if (ref.current) observer.observe(ref.current);
      return observer;
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <section id="features" className="py-36 px-8" style={{ background: "var(--bg-void)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <div 
            className="text-xs font-mono tracking-widest mb-4"
            style={{ color: "var(--accent-teal)" }}
          >
            HOW WATCHLLM WORKS
          </div>
        </div>

        {/* Step 01 */}
        <div 
          ref={stepRefs[0]}
          className="grid md:grid-cols-2 gap-16 items-center mb-32"
          style={{
            opacity: stepVisible[0] ? 1 : 0,
            transform: stepVisible[0] ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease-out"
          }}
        >
          <div>
            <div className="text-xs font-mono mb-4" style={{ color: "var(--accent-teal)" }}>01</div>
            <h3 
              className="font-bold mb-5"
              style={{ 
                fontSize: "var(--text-title)",
                lineHeight: 1.1,
                letterSpacing: "-1px",
                color: "var(--text-primary)"
              }}
            >
              Break it before users do
            </h3>
            <p className="text-base mb-5" style={{ color: "var(--text-secondary)" }}>
              Run 20+ adversarial attack scenarios against your agent. Prompt injection, tool abuse, hallucination, jailbreak — find the cracks before production does.
            </p>
            <a 
              href="#" 
              className="text-xs"
              style={{ color: "var(--accent-teal)" }}
            >
              View all attack categories →
            </a>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {attackScenarios.map((scenario, i) => (
              <div
                key={scenario}
                className="px-4 py-2 rounded-md border text-center text-xs font-mono transition-all duration-300"
                style={{
                  borderColor: stepVisible[0] ? "var(--border-subtle)" : "transparent",
                  color: "var(--text-muted)",
                  opacity: stepVisible[0] ? 1 : 0,
                  transform: stepVisible[0] ? "translateY(0)" : "translateY(10px)",
                  transitionDelay: `${i * 50}ms`
                }}
              >
                {scenario}
              </div>
            ))}
          </div>
        </div>

        {/* Step 02 */}
        <div 
          ref={stepRefs[1]}
          className="grid md:grid-cols-2 gap-16 items-center mb-32"
          style={{
            opacity: stepVisible[1] ? 1 : 0,
            transform: stepVisible[1] ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease-out"
          }}
        >
          <div className="order-2 md:order-1">
            <div className="w-full aspect-video rounded-xl border overflow-hidden relative" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <svg viewBox="0 0 460 340" className="w-full h-full">
                {/* Execution graph visualization */}
                <circle cx="60" cy="60" r="8" fill="#ffffff"/>
                <line x1="60" y1="68" x2="140" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                <circle cx="140" cy="100" r="8" fill="#7b61ff"/>
                <line x1="140" y1="108" x2="220" y2="80" stroke="rgba(123,97,255,0.3)" strokeWidth="1"/>
                <circle cx="220" cy="80" r="8" fill="#00e5b0"/>
                <line x1="220" y1="88" x2="300" y2="120" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                <circle cx="300" cy="120" r="8" fill="#00e5b0"/>
                <line x1="300" y1="128" x2="380" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                <circle cx="380" cy="180" r="8" fill="#ff6b35"/>
                <text x="380" y="205" textAnchor="middle" fill="#44445a" fontSize="10" fontFamily="JetBrains Mono">failed</text>
              </svg>
              <div className="absolute bottom-5 left-5 right-5">
                <div className="w-full h-0.5 rounded relative" style={{ background: "var(--border-subtle)" }}>
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full" style={{ background: "var(--accent-teal)", left: "30%" }} />
                </div>
                <div className="text-xs font-mono mt-3" style={{ color: "var(--text-muted)" }}>
                  Node 2 of 7 · llm_call · 234ms
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="text-xs font-mono mb-4" style={{ color: "var(--accent-teal)" }}>02</div>
            <h3 
              className="font-bold mb-5"
              style={{ 
                fontSize: "var(--text-title)",
                lineHeight: 1.1,
                letterSpacing: "-1px",
                color: "var(--text-primary)"
              }}
            >
              Rewind to the exact moment it broke
            </h3>
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              Every run becomes an interactive graph. Scrub through execution time. See exactly which node failed, what inputs triggered it, and why.
            </p>
          </div>
        </div>

        {/* Step 03 */}
        <div 
          ref={stepRefs[2]}
          className="grid md:grid-cols-2 gap-16 items-center"
          style={{
            opacity: stepVisible[2] ? 1 : 0,
            transform: stepVisible[2] ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease-out"
          }}
        >
          <div>
            <div className="text-xs font-mono mb-4" style={{ color: "var(--accent-teal)" }}>03</div>
            <h3 
              className="font-bold mb-5"
              style={{ 
                fontSize: "var(--text-title)",
                lineHeight: 1.1,
                letterSpacing: "-1px",
                color: "var(--text-primary)"
              }}
            >
              Fix once. Don&apos;t rerun everything.
            </h3>
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              Fork from any failure node. Test your fix in isolation. No need to rerun the entire agent from scratch. Save credits, ship faster.
            </p>
          </div>
          <div className="w-full aspect-video rounded-xl border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
            <svg viewBox="0 0 460 340" className="w-full h-full">
              {/* Left tree - failed */}
              <g opacity="0.5">
                <circle cx="80" cy="60" r="8" fill="#ffffff"/>
                <line x1="80" y1="68" x2="80" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <circle cx="80" cy="120" r="8" fill="#7b61ff"/>
                <line x1="80" y1="128" x2="80" y2="180" stroke="rgba(123,97,255,0.3)" strokeWidth="1"/>
                <circle cx="80" cy="180" r="8" fill="#00e5b0"/>
                <line x1="80" y1="188" x2="80" y2="240" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <circle cx="80" cy="240" r="8" fill="#00e5b0"/>
                <line x1="80" y1="248" x2="80" y2="300" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <circle cx="80" cy="300" r="8" fill="#ff3366"/>
                <text x="80" y="320" textAnchor="middle" fill="#44445a" fontSize="10" fontFamily="JetBrains Mono">FAILED</text>
              </g>
              
              {/* Right tree - passed */}
              <g opacity={stepVisible[2] ? 1 : 0} style={{ transition: "opacity 0.5s" }}>
                <circle cx="300" cy="60" r="8" fill="#ffffff"/>
                <line x1="300" y1="68" x2="300" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <circle cx="300" cy="120" r="8" fill="#7b61ff"/>
                <line x1="300" y1="128" x2="300" y2="180" stroke="rgba(123,97,255,0.3)" strokeWidth="1"/>
                <circle cx="300" cy="180" r="8" fill="#00e5b0"/>
                <line x1="300" y1="188" x2="300" y2="240" stroke="rgba(0,229,176,0.3)" strokeWidth="1"/>
                <circle cx="300" cy="240" r="8" fill="#00e5b0"/>
                <line x1="300" y1="248" x2="300" y2="300" stroke="rgba(0,229,176,0.3)" strokeWidth="1"/>
                <circle cx="300" cy="300" r="8" fill="rgba(0,229,176,0.8)"/>
                <text x="300" y="320" textAnchor="middle" fill="#00e5b0" fontSize="10" fontFamily="JetBrains Mono">PASSED</text>
              </g>
              
              {/* Fork line */}
              <line x1="88" y1="180" x2="292" y2="180" stroke="rgba(0,229,176,0.3)" strokeWidth="1" strokeDasharray="5,5"/>
              <text x="190" y="175" textAnchor="middle" fill="#00e5b0" fontSize="10" fontFamily="JetBrains Mono">fork point</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
