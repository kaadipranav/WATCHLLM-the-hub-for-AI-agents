"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Magnet from "../reactbits/Magnet";
import SplitText from "../reactbits/SplitText";
import BlurIn from "../reactbits/BlurIn";


const Aurora = dynamic(() => import("../reactbits/Aurora"), { ssr: false });

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: "100dvh", paddingTop: 52, background: "#060608" }}>
      <div className="absolute inset-0 z-0 opacity-40">
        <Aurora colorStops={["#00C896", "#7B61FF", "#060608"]} amplitude={isMobile ? 0.65 : 0.8} blend={0.15} speed={isMobile ? 0.25 : 0.4} />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full px-6" style={{ maxWidth: 800 }}>
        <BlurIn
          text="Agent Reliability Platform"
          animateBy="words"
          delay={0}
          className="inline-flex items-center gap-2"
        />
        <div
          className="inline-flex items-center gap-2 -mt-6"
          style={{
            border: "1px solid rgba(0,200,150,0.3)",
            background: "rgba(0,200,150,0.06)",
            borderRadius: 9999,
            padding: "4px 12px",
            height: 28,
          }}
        >
          <span className="rounded-full" style={{ width: 6, height: 6, background: "#00C896", animation: "pulse-dot 2s ease-in-out infinite" }} />
          <span style={{ fontSize: 12, color: "#00C896", letterSpacing: "0.05em" }}>Agent Reliability Platform</span>
        </div>

        <div className="mt-10 mb-20 text-center" style={{ minHeight: 120 }}>
          <SplitText
            tag="h1"
            text={"The Reliability Layer for\nAgentic AI"}
            splitType="words"
            delay={40}
            duration={0.6}
            className="text-[44px] md:text-[72px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#EDEDED]"
          />
        </div>

        <BlurIn
          text="Run adversarial simulations. Replay traces as a graph. Ship agents that stay within guardrails."
          animateBy="words"
          delay={30}
          className="mt-2 text-center text-[16px] md:text-[20px] text-[#666672] leading-[1.5] max-w-[500px]"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
          className="flex items-center gap-4 mt-12"
        >
          <Magnet padding={40} magnetStrength={3}>
            <motion.div whileHover={{ scale: 1.03, filter: "brightness(1.08)" }} transition={{ duration: 0.2, ease: "easeOut" }}>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center font-medium transition-all duration-150"
                style={{
                  height: 48,
                  paddingLeft: 32,
                  paddingRight: 32,
                  borderRadius: 8,
                  background: "#00C896",
                  color: "#060608",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Join the waitlist
              </Link>
            </motion.div>
          </Magnet>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center transition-all duration-150"
            style={{
              height: 48,
              paddingLeft: 32,
              paddingRight: 32,
              borderRadius: 8,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#EDEDED",
              fontSize: 16,
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
      </div>
    </section>
  );
}

