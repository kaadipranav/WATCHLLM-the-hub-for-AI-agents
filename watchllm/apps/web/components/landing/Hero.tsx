"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import Magnet from "../reactbits/Magnet";
import SplitText from "../reactbits/SplitText";
import BlurIn from "../reactbits/BlurIn";
import SimulationMockTerminal from "./SimulationMockTerminal";

const Prism = dynamic(() => import("../reactbits/Prism"), { ssr: false });

export default function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: "100dvh", paddingTop: 52, background: "#060608" }}
    >
      {/* Prism background — absolute, non-blocking */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Prism
          animationType="rotate"
          timeScale={0.3}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          glow={0.7}
          noise={0.1}
          colorFrequency={0.8}
          hueShift={0}
          bloom={0.6}
          transparent={true}
        />
        {/* Vignette overlay to keep center text readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 65% 55% at 50% 50%, transparent 0%, #060608 85%)",
            pointerEvents: "none",
          }}
        />
        {/* Hard fade at top and bottom edges */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, #060608 0%, transparent 12%, transparent 80%, #060608 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Content — z-10 */}
      <div
        className="relative flex flex-col items-center w-full px-6 text-center"
        style={{ maxWidth: 800, zIndex: 10 }}
      >
        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0, ease: "easeOut" }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid rgba(0,200,150,0.25)",
            background: "rgba(0,200,150,0.05)",
            borderRadius: 9999,
            padding: "4px 14px",
            marginBottom: 32,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00C896",
              display: "inline-block",
              animation: "pulse-dot 2s ease infinite",
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#00C896",
              letterSpacing: "0.06em",
              fontFamily: "var(--font-geist-sans, 'Inter', sans-serif)",
            }}
          >
            Agent Reliability Platform
          </span>
        </motion.div>

        {/* H1 via SplitText */}
        <div style={{ minHeight: 160 }}>
          <SplitText
            tag="h1"
            text={"Your agent breaks in prod.\nWatchLLM shows you why."}
            splitType="words"
            delay={30}
            duration={0.5}
            from={{ opacity: 0, y: 32 }}
            to={{ opacity: 1, y: 0 }}
            className="text-[42px] md:text-[64px] font-semibold leading-[1.06] tracking-[-0.03em] text-[#EDEDED]"
          />
        </div>

        {/* Subtext via BlurIn */}
        <div style={{ marginTop: 8, maxWidth: 480, color: "#666672" }}>
          <BlurIn
            text="Stress test with 20+ adversarial scenarios. Replay any run as a graph. Fork from any failure node."
            animateBy="words"
            delay={30}
            className="text-[15px] md:text-[17px] leading-[1.65] text-center text-[#666672]"
          />
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 32 }}
        >
          <Magnet padding={40} magnetStrength={6}>
            <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.15, ease: "easeOut" }}>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center font-medium"
                style={{
                  height: 42,
                  paddingLeft: 24,
                  paddingRight: 24,
                  borderRadius: 7,
                  background: "#00C896",
                  color: "#060608",
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Start testing free
              </Link>
            </motion.div>
          </Magnet>

          <Link
            href="/docs"
            className="inline-flex items-center justify-center"
            style={{
              height: 42,
              paddingLeft: 24,
              paddingRight: 24,
              borderRadius: 7,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#EDEDED",
              fontSize: 15,
              transition: "border-color 150ms ease, background 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Read the docs
          </Link>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.9, ease: "easeOut" }}
          style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}
        >
          {["No credit card", "Any framework", "5 min setup"].map((text, i) => (
            <span key={text} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 12, color: "#333338" }}>{text}</span>
              {i < 2 && <span style={{ fontSize: 12, color: "#333338", marginLeft: -8 }}>·</span>}
            </span>
          ))}
        </motion.div>

        {/* Terminal */}
        <div
          style={{ marginTop: 64, width: "100%", display: "flex", justifyContent: "center" }}
        >
          <SimulationMockTerminal />
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
      `}</style>
    </section>
  );
}
