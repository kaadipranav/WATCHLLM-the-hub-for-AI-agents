"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  return (
    <footer 
      className="py-12 px-8 border-t"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        <div className="max-w-xs">
          <Link 
            href="/" 
            className="inline-block text-xl font-bold relative group"
            style={{ color: "var(--text-primary)" }}
            onMouseEnter={() => setShowEasterEgg(true)}
            onMouseLeave={() => setShowEasterEgg(false)}
          >
            Watch<span style={{ color: "var(--accent-teal)" }}>LLM</span>
            
            {/* Easter egg mini graph */}
            {showEasterEgg && (
              <svg 
                className="absolute -bottom-1 left-0 w-full h-5"
                viewBox="0 0 100 20"
              >
                <circle cx="10" cy="10" r="3" fill="#fff">
                  <animate attributeName="opacity" values="0;1;0" dur="0.3s" begin="0s" fill="freeze"/>
                </circle>
                <circle cx="35" cy="10" r="3" fill="#7b61ff">
                  <animate attributeName="opacity" values="0;1;0" dur="0.3s" begin="0.3s" fill="freeze"/>
                </circle>
                <circle cx="60" cy="10" r="3" fill="#00e5b0">
                  <animate attributeName="opacity" values="0;1;0" dur="0.3s" begin="0.6s" fill="freeze"/>
                </circle>
                <circle cx="85" cy="10" r="3" fill="rgba(0,229,176,0.8)">
                  <animate attributeName="opacity" values="0;1;1" dur="0.3s" begin="0.9s" fill="freeze"/>
                </circle>
              </svg>
            )}
          </Link>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
            Chaos monkey for AI agents.
          </p>
          <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
            © 2025 WatchLLM. All rights reserved.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link href="/docs" className="text-xs transition-colors" style={{ color: "var(--text-secondary)" }}>Docs</Link>
          <Link href="/changelog" className="text-xs transition-colors" style={{ color: "var(--text-secondary)" }}>Changelog</Link>
          <Link href="/#pricing" className="text-xs transition-colors" style={{ color: "var(--text-secondary)" }}>Pricing</Link>
          <Link href="/blog" className="text-xs transition-colors" style={{ color: "var(--text-secondary)" }}>Blog</Link>
        </div>

        <div className="text-right">
          <p className="text-xs mb-2">
            <a href="https://twitter.com/watchllm" style={{ color: "var(--accent-teal)" }}>@watchllm</a>
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Built by engineers, for engineers.
          </p>
        </div>
      </div>
    </footer>
  );
}
