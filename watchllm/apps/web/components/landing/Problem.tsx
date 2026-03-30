"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { IconBug, IconClockPin, IconCoins } from "@tabler/icons-react";

import GlowingCard from "../reactbits/GlowingCard";

const cards = [
  {
    icon: IconBug,
    title: "Agents fail silently",
    body: "You find out when a user reports it. By then, the damage is done.",
  },
  {
    icon: IconClockPin,
    title: "Logs don't replay",
    body: "You see the crash. You can't rewind to what caused it.",
  },
  {
    icon: IconCoins,
    title: "Debugging burns credits",
    body: "Every debug attempt reruns the full agent. Costs stack up fast.",
  },
];

export default function Problem() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      style={{
        paddingTop: 120,
        paddingBottom: 120,
        background: "#060608",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 960, width: "100%", paddingLeft: 24, paddingRight: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#00C896",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
            }}
          >
            The Problem
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          style={{
            marginTop: 16,
            fontSize: "clamp(34px, 4vw, 48px)",
            fontWeight: 600,
            color: "#EDEDED",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            maxWidth: 640,
          }}
        >
          Agents work in dev. Production is different.
        </motion.h2>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: 16, marginTop: 56 }}
        >
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: "easeOut" }}
            >
              <GlowingCard
                className="rounded-[10px] p-7 min-h-[210px]"
                glowColor="rgba(0, 200, 150, 0.12)"
                borderColor="rgba(255, 255, 255, 0.07)"
              >
                <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 28, minHeight: 210 }}>
                  <card.icon size={22} style={{ color: "#00C896" }} />
                  <h3 style={{ fontSize: 15, fontWeight: 500, color: "#EDEDED", marginTop: 16 }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "#666672", lineHeight: 1.65, marginTop: 8 }}>
                    {card.body}
                  </p>
                </div>
              </GlowingCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
