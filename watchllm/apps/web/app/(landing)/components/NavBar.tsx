"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 w-full px-8 transition-all duration-400 ${
        scrolled
          ? "border-b backdrop-blur-xl"
          : "border-b-0 bg-transparent backdrop-blur-none"
      }`}
      style={{
        borderColor: scrolled ? "var(--border-subtle)" : "transparent",
        background: scrolled ? "rgba(2, 2, 5, 0.85)" : "transparent",
      }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <Link href="/" className="magnetic text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Watch<span style={{ color: "var(--accent-teal)" }}>LLM</span>
        </Link>
        
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link 
            href="/docs" 
            className="magnetic relative transition-colors duration-200 group"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Docs
            <span 
              className="absolute bottom-0 left-0 w-0 h-px transition-all duration-200 group-hover:w-full"
              style={{ background: "var(--accent-teal)" }}
            />
          </Link>
          <Link 
            href="/changelog" 
            className="magnetic relative transition-colors duration-200 group"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Changelog
            <span 
              className="absolute bottom-0 left-0 w-0 h-px transition-all duration-200 group-hover:w-full"
              style={{ background: "var(--accent-teal)" }}
            />
          </Link>
          <Link 
            href="/#pricing" 
            className="magnetic relative transition-colors duration-200 group"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Pricing
            <span 
              className="absolute bottom-0 left-0 w-0 h-px transition-all duration-200 group-hover:w-full"
              style={{ background: "var(--accent-teal)" }}
            />
          </Link>
        </nav>

        <div className="hidden items-center gap-5 text-sm md:flex">
          <Link 
            href="/sign-in" 
            className="magnetic transition-colors duration-200"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="magnetic rounded-md px-5 py-2.5 font-semibold transition-all duration-200 hover:scale-105"
            style={{ 
              background: "var(--accent-teal)", 
              color: "#000",
              boxShadow: "var(--glow-teal)"
            }}
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          aria-label="Open navigation menu"
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="w-6 h-0.5 bg-white transition-all" style={{ transform: mobileOpen ? "rotate(45deg) translateY(4px)" : "none" }} />
          <span className="w-6 h-0.5 bg-white transition-all" style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span className="w-6 h-0.5 bg-white transition-all" style={{ transform: mobileOpen ? "rotate(-45deg) translateY(-4px)" : "none" }} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 transition-all duration-300 md:hidden ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{ background: "var(--bg-void)" }}
      >
        <Link 
          href="/docs" 
          className="text-2xl font-medium transition-all duration-300"
          style={{ 
            color: "var(--text-primary)",
            transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
            opacity: mobileOpen ? 1 : 0,
            transitionDelay: "100ms"
          }}
          onClick={() => setMobileOpen(false)}
        >
          Docs
        </Link>
        <Link 
          href="/changelog" 
          className="text-2xl font-medium transition-all duration-300"
          style={{ 
            color: "var(--text-primary)",
            transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
            opacity: mobileOpen ? 1 : 0,
            transitionDelay: "150ms"
          }}
          onClick={() => setMobileOpen(false)}
        >
          Changelog
        </Link>
        <Link 
          href="/#pricing" 
          className="text-2xl font-medium transition-all duration-300"
          style={{ 
            color: "var(--text-primary)",
            transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
            opacity: mobileOpen ? 1 : 0,
            transitionDelay: "200ms"
          }}
          onClick={() => setMobileOpen(false)}
        >
          Pricing
        </Link>
        <Link 
          href="/sign-in" 
          className="text-2xl font-medium transition-all duration-300"
          style={{ 
            color: "var(--text-secondary)",
            transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
            opacity: mobileOpen ? 1 : 0,
            transitionDelay: "250ms"
          }}
          onClick={() => setMobileOpen(false)}
        >
          Sign in
        </Link>
        <Link 
          href="/sign-up"
          className="mt-4 px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300"
          style={{ 
            background: "var(--accent-teal)", 
            color: "#000",
            transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
            opacity: mobileOpen ? 1 : 0,
            transitionDelay: "300ms"
          }}
          onClick={() => setMobileOpen(false)}
        >
          Get started
        </Link>
      </div>
    </header>
  );
}
