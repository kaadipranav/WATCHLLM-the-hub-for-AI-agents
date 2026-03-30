"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Magnet from "../reactbits/Magnet";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} style={{ position: "absolute", top: 80, left: 0, width: 1, height: 1 }} />
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
        style={{
          height: 52,
          transition: "background 180ms ease, border-color 180ms ease, backdrop-filter 180ms ease",
          background: scrolled ? "rgba(6,6,8,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        }}
      >
        <Link href="/" style={{ fontFamily: "var(--font-geist-sans, 'Inter', sans-serif)", fontSize: 17, display: "flex", alignItems: "center", gap: 0 }}>
          <span style={{ fontWeight: 500, color: "#EDEDED" }}>Watch</span>
          <span style={{ fontWeight: 600, color: "#00C896" }}>LLM</span>
        </Link>

        <nav className="hidden md:flex items-center" style={{ gap: 32 }}>
          {(["Docs", "Changelog", "Pricing"] as const).map((label) => (
            <Link
              key={label}
              href={label === "Pricing" ? "#pricing" : `/${label.toLowerCase()}`}
              style={{ fontSize: 14, color: "#666672", transition: "color 150ms ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#EDEDED")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#666672")}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center" style={{ gap: 12 }}>
          <Link
            href="/sign-in"
            className="hidden md:inline-block"
            style={{ fontSize: 14, color: "#666672", transition: "color 150ms ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EDEDED")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#666672")}
          >
            Sign in
          </Link>
          <Magnet padding={40} magnetStrength={3}>
            <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.15, ease: "easeOut" }}>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center"
                style={{
                  height: 32,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderRadius: 6,
                  background: "#00C896",
                  color: "#060608",
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                Get started
              </Link>
            </motion.div>
          </Magnet>
        </div>
      </header>
    </>
  );
}
