"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [heroVisible, setHeroVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 h-14 w-full px-6 lg:px-12 transition ${
        heroVisible
          ? "border-b border-transparent bg-transparent"
          : "border-b border-white/10 bg-[#080808]/75 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-mono text-base font-semibold tracking-widest text-accent">
            WatchLLM
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-gray-400 md:flex">
            <Link href="/#features" className="transition hover:text-white">
              Product
            </Link>
            <Link href="/docs" className="transition hover:text-white">
              Docs
            </Link>
            <Link href="/#pricing" className="transition hover:text-white">
              Pricing
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-4 text-sm md:flex">
          <Link href="/sign-in" className="text-gray-400 transition hover:text-white">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-accent px-4 py-1.5 font-medium text-black transition hover:bg-accent/90"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          aria-label="Open navigation menu"
          className="rounded-md border border-white/10 p-2 text-gray-200 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      <div
        className={`mx-auto max-w-7xl overflow-hidden transition-all duration-300 md:hidden ${
          mobileOpen ? "max-h-60 border-t border-white/10" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-2 py-3 text-sm text-gray-300">
          <Link href="/#features" className="rounded px-2 py-1 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
            Product
          </Link>
          <Link href="/docs" className="rounded px-2 py-1 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
            Docs
          </Link>
          <Link href="/#pricing" className="rounded px-2 py-1 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
            Pricing
          </Link>
          <Link href="/sign-in" className="rounded px-2 py-1 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
            Sign in
          </Link>
          <Link href="/sign-up" className="rounded bg-accent px-2 py-1 font-medium text-black" onClick={() => setMobileOpen(false)}>
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
