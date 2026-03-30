"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Magnet from "../reactbits/Magnet";

export default function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      style={{
        paddingTop: 120,
        paddingBottom: 120,
        textAlign: "center",
        background: "linear-gradient(to bottom, transparent, rgba(0,200,150,0.03) 50%, transparent)",
      }}
    >
      <div style={{ maxWidth: 620, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            fontSize: "clamp(30px, 4vw, 44px)",
            fontWeight: 600,
            color: "#EDEDED",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
          }}
        >
          Your agent is one bad prompt away from a production incident.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          style={{ fontSize: 18, color: "#666672", marginTop: 16 }}
        >
          Find out what it does under pressure. Before your users do.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
          style={{ marginTop: 32, display: "flex", justifyContent: "center" }}
        >
          <Magnet padding={50} magnetStrength={4}>
            <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.15, ease: "easeOut" }}>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center"
                style={{
                  height: 48,
                  paddingLeft: 32,
                  paddingRight: 32,
                  borderRadius: 8,
                  background: "#00C896",
                  color: "#060608",
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                Start testing free
              </Link>
            </motion.div>
          </Magnet>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
          style={{ fontSize: 12, color: "#333338", marginTop: 16 }}
        >
          No credit card. Setup in 5 minutes. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
}
