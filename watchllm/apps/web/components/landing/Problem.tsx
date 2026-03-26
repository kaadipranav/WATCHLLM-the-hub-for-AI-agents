"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { IconBug, IconRewindBackward5, IconCurrencyDollar } from "@tabler/icons-react";
import GlowingCard from "../reactbits/GlowingCard";

const cards = [
  {
    icon: IconBug,
    title: "Agents fail silently",
    body: "You find out when a user complains. By then the damage is done.",
  },
  {
    icon: IconRewindBackward5,
    title: "Logs don't replay",
    body: "You see the crash. You can't wind back to what caused it.",
  },
  {
    icon: IconCurrencyDollar,
    title: "Debugging burns money",
    body: "Every debug attempt reruns the whole agent. API costs stack up fast.",
  },
];

export default function Problem() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="relative flex flex-col items-center px-6"
      style={{ paddingTop: 120, paddingBottom: 120, background: "#060608" }}
    >
      <span style={{ fontSize: 11, color: "#00C896", letterSpacing: "0.12em", fontWeight: 500 }}>THE PROBLEM</span>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="text-center mt-4"
        style={{
          fontSize: "clamp(34px, 4vw, 48px)",
          fontWeight: 600,
          color: "#EDEDED",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}
      >
        Agents work fine in dev.
        <br />
        Production is a different story.
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 w-full" style={{ maxWidth: 900 }}>
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.12, ease: "easeOut" }}
          >
            <GlowingCard
              className="rounded-[10px] p-5 min-h-[210px]"
              glowColor="rgba(0,200,150,0.15)"
              borderColor="rgba(255,255,255,0.08)"
            >
              <card.icon size={24} style={{ color: "#00C896" }} />
              <h3 style={{ fontSize: 16, fontWeight: 500, color: "#EDEDED", marginTop: 12 }}>{card.title}</h3>
              <p style={{ fontSize: 14, color: "#666672", lineHeight: 1.6, marginTop: 8 }}>{card.body}</p>
            </GlowingCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
