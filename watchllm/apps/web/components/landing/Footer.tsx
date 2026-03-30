"use client";
import Link from "next/link";

import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";

const NAV_COLS = [
  {
    header: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "/changelog" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    header: "Developers",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "SDK Reference", href: "/docs/sdk" },
      { label: "CLI", href: "/docs/cli" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },
  {
    header: "Company",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: 48,
        paddingBottom: 32,
        background: "#060608",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 32 }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "var(--font-geist-sans, sans-serif)", fontSize: 17 }}>
              <span style={{ fontWeight: 500, color: "#EDEDED" }}>Watch</span>
              <span style={{ fontWeight: 600, color: "#00C896" }}>LLM</span>
            </div>
            <p style={{ fontSize: 13, color: "#333338", marginTop: 8 }}>Agent reliability platform.</p>
          </div>

          {/* Link columns */}
          {NAV_COLS.map((col) => (
            <div key={col.header}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#666672", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                {col.header}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{ fontSize: 13, color: "#333338", transition: "color 150ms ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#666672")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#333338")}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, color: "#333338" }}>
            © 2025 WatchLLM. Built for engineers who ship agents.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              href="https://github.com"
              aria-label="GitHub"
              style={{ color: "#333338", transition: "color 150ms ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#666672")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333338")}
            >
              <IconBrandGithub size={16} />
            </Link>
            <Link
              href="https://x.com"
              aria-label="X / Twitter"
              style={{ color: "#333338", transition: "color 150ms ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#666672")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333338")}
            >
              <IconBrandX size={16} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
