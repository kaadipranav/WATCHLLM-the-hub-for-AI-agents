"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import Magnet from "../reactbits/Magnet";
import SimulationMockTerminal from "./SimulationMockTerminal";

const Aurora = dynamic(() => import("../reactbits/Aurora"), { ssr: false });

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: "100dvh", paddingTop: 52, background: "#060608" }}>
      {/* Aurora background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Aurora colorStops={["#00C896", "#7B61FF", "#060608"]} amplitude={0.8} blend={0.15} speed={0.4} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full px-6" style={{ maxWidth: 800 }}>
        {/* Eyebrow tag */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: 0 }}
          className="inline-flex items-center gap-2"
          style={{
            border: "1px solid rgba(0,200,150,0.3)",
            background: "rgba(0,200,150,0.06)",
            borderRadius: 9999,
            padding: "4px 12px",
          }}
        >
          <span className="rounded-full animate-ping-slow" style={{ width: 6, height: 6, background: "#00C896" }} />
          <span style={{ fontSize: 12, color: "#00C896", letterSpacing: "0.05em", fontWeight: 500 }}>
            Agent Reliability Platform
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-center mt-6"
          style={{
            fontFamily: "var(--font-geist-sans, 'Inter', sans-serif)",
            fontSize: "clamp(40px, 5vw, 64px)",
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#EDEDED",
          }}
        >
          Your agent breaks in prod.
          <br />
          WatchLLM shows you{" "}
          <span style={{ color: "#00C896" }}>exactly why.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-5"
        >
          <p
            className="text-center"
            style={{
              fontSize: "clamp(16px, 1.2vw, 18px)",
              color: "#666672",
              lineHeight: 1.6,
              maxWidth: 520,
            }}
          >
            Stress test with 20+ attack scenarios. Replay any run as a graph.
            Fork from any failure node. Ship agents that don&apos;t wake you up at 3am.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center gap-3 mt-8"
        >
          <Magnet padding={40} magnetStrength={3}>
            <Link
              href="/api/v1/auth/signin/github"
              className="inline-flex items-center justify-center font-medium transition-all duration-150 hover:brightness-110 hover:scale-[1.03]"
              style={{
                height: 40,
                paddingLeft: 24,
                paddingRight: 24,
                borderRadius: 7,
                background: "#00C896",
                color: "#060608",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              Start testing free
            </Link>
          </Magnet>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center transition-all duration-150"
            style={{
              height: 40,
              paddingLeft: 24,
              paddingRight: 24,
              borderRadius: 7,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#EDEDED",
              fontSize: 15,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Read the docs
          </Link>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="flex items-center gap-4 mt-5"
          style={{ fontSize: 12, color: "#444450" }}
        >
          <span>No credit card</span>
          <span>·</span>
          <span>Works with any framework</span>
          <span>·</span>
          <span>Deploy in 5 min</span>
        </motion.div>

        {/* Terminal mock */}
        <div className="mt-16 w-full">
          <SimulationMockTerminal />
        </div>
      </div>
    </section>
  );
}
