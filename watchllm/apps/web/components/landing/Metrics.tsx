"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "../reactbits/CountUp";

const stats = [
  { value: null, countTo: 20, suffix: "+", label: "attack categories" },
  { value: "< 5", countTo: null, suffix: "", label: "minutes to first run" },
  { value: null, countTo: 100, suffix: "%", label: "execution graph coverage" },
  { value: "$0", countTo: null, suffix: "", label: "wasted reruns with fork & replay" },
];

export default function Metrics() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      style={{ paddingTop: 80, paddingBottom: 80, background: "#060608" }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              style={{
                textAlign: "center",
                padding: "0 32px",
                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-geist-mono, monospace)",
                  fontSize: "clamp(36px, 4vw, 52px)",
                  fontWeight: 600,
                  color: "#00C896",
                  lineHeight: 1,
                }}
              >
                {stat.countTo !== null ? (
                  <CountUp to={stat.countTo} duration={2} className="" />
                ) : (
                  <span>{stat.value}</span>
                )}
                {stat.suffix && <span>{stat.suffix}</span>}
              </div>
              <div style={{ fontSize: 14, color: "#666672", marginTop: 8 }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
