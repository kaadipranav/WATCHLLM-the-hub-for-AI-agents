"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "../reactbits/CountUp";

const stats = [
  { value: 500000, suffix: "+", label: "Attack scenarios run", format: "500K+" },
  { value: 20, suffix: "+", label: "Attack categories" },
  { value: 99.7, suffix: "%", label: "Uptime SLA" },
  { value: 200, suffix: "ms", label: "Avg simulation latency" },
];

export default function Metrics() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section
      ref={ref}
      className="flex flex-col items-center px-6"
      style={{
        paddingTop: 80,
        paddingBottom: 80,
        background: "#060608",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full"
        style={{ maxWidth: 780 }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
          >
            <div
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: 600,
                color: "#EDEDED",
                letterSpacing: "-0.03em",
                fontFamily: "var(--font-geist-sans, 'Inter', sans-serif)",
              }}
            >
              {s.format ? (
                <span>{s.format}</span>
              ) : (
                <>
                  <CountUp
                    to={s.value}
                    from={0}
                    duration={2}
                    className=""
                    separator=","
                  />
                  <span>{s.suffix}</span>
                </>
              )}
            </div>
            <span
              style={{
                fontSize: 13,
                color: "#444450",
                marginTop: 4,
              }}
            >
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
