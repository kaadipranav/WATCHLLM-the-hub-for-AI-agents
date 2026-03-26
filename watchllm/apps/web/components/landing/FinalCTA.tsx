"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Magnet from "../reactbits/Magnet";

export default function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section
      ref={ref}
      className="flex flex-col items-center px-6"
      style={{
        paddingTop: 120,
        paddingBottom: 120,
        background: "linear-gradient(180deg, #060608 0%, rgba(0,200,150,0.03) 50%, #060608 100%)",
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
        style={{
          fontSize: "clamp(28px, 3.5vw, 48px)",
          fontWeight: 600,
          color: "#EDEDED",
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          maxWidth: 600,
        }}
      >
        Your agent is one bad run away from a production incident.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="text-center mt-5"
        style={{ fontSize: 15, color: "#666672", maxWidth: 400, lineHeight: 1.6 }}
      >
        Find out what it does under pressure before your users do.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mt-8"
      >
        <Magnet padding={50} magnetStrength={3}>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center font-medium transition-all duration-200 hover:brightness-110 hover:scale-[1.03]"
            style={{
              height: 48,
              paddingLeft: 32,
              paddingRight: 32,
              borderRadius: 8,
              background: "#00C896",
              color: "#060608",
              fontSize: 16,
              fontWeight: 500,
              boxShadow: "0 0 32px rgba(0,200,150,0.16)",
            }}
          >
            Start testing free — it takes 5 minutes
          </Link>
        </Magnet>
      </motion.div>
    </section>
  );
}
