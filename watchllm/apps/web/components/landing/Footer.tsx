"use client";
import Link from "next/link";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/docs/api" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: "#" },
      { label: "GitHub", href: "https://github.com" },
      { label: "Twitter", href: "https://twitter.com" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="px-6"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "#060608",
        paddingTop: 48,
        paddingBottom: 32,
      }}
    >
      <div
        className="mx-auto flex flex-col md:flex-row gap-10 md:gap-0 md:justify-between"
        style={{ maxWidth: 780 }}
      >
        {/* Logo col */}
        <div>
          <Link href="/" className="flex items-center gap-0" style={{ fontSize: 17 }}>
            <span className="font-medium" style={{ color: "#EDEDED" }}>Watch</span>
            <span className="font-semibold" style={{ color: "#00C896" }}>LLM</span>
          </Link>
          <p style={{ fontSize: 13, color: "#444450", marginTop: 8, maxWidth: 180, lineHeight: 1.5 }}>
            The reliability platform for AI agents.
          </p>
        </div>

        {/* Link cols */}
        <div className="flex gap-12 flex-wrap">
          {footerLinks.map((col) => (
            <div key={col.title}>
              <span
                style={{
                  fontSize: 12,
                  color: "#666672",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  fontFamily: "var(--font-geist-mono, monospace)",
                }}
              >
                {col.title.toUpperCase()}
              </span>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-colors duration-150"
                      style={{ fontSize: 13, color: "#444450" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#EDEDED")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#444450")}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div
        className="mx-auto mt-10 pt-6 flex items-center justify-between"
        style={{
          maxWidth: 780,
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <span style={{ fontSize: 12, color: "#333338" }}>
          © {new Date().getFullYear()} WatchLLM. All rights reserved.
        </span>
        <div className="flex items-center gap-5">
          <Link
            href="#"
            style={{ fontSize: 12, color: "#333338" }}
            className="transition-colors hover:text-[#666672]"
          >
            Privacy
          </Link>
          <Link
            href="#"
            style={{ fontSize: 12, color: "#333338" }}
            className="transition-colors hover:text-[#666672]"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
