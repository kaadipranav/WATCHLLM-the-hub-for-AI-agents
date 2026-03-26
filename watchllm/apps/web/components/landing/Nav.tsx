"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Magnet from "../reactbits/Magnet";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 transition-all duration-200"
      style={{
        height: 52,
        background: scrolled ? "rgba(6,6,8,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <Link href="/" className="flex items-center gap-0" style={{ fontFamily: "var(--font-geist-sans, 'Inter', sans-serif)", fontSize: 17 }}>
        <span className="font-medium" style={{ color: "#EDEDED" }}>Watch</span>
        <span className="font-semibold" style={{ color: "#00C896" }}>LLM</span>
      </Link>

      <nav className="hidden md:flex items-center" style={{ gap: 32 }}>
        {["Docs", "Changelog", "Pricing"].map((label) => (
          <Link
            key={label}
            href={label === "Pricing" ? "#pricing" : `/${label.toLowerCase()}`}
            className="transition-colors duration-150"
            style={{ fontSize: 14, color: "#666672" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EDEDED")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#666672")}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className="hidden md:inline-block transition-colors duration-150"
          style={{ fontSize: 14, color: "#666672" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EDEDED")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#666672")}
        >
          Sign in
        </Link>
        <Magnet padding={40} magnetStrength={3}>
          <motion.div whileHover={{ scale: 1.02, filter: "brightness(1.1)" }} transition={{ duration: 0.2, ease: "easeOut" }}>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center font-medium transition-all duration-150"
              style={{
                height: 32,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 6,
                background: "#00C896",
                color: "#060608",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Get started
            </Link>
          </motion.div>
        </Magnet>
      </div>
    </header>
  );
}
