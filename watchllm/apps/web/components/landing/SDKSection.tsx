"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const code = `import { WatchLLM } from '@watchllm/sdk';

const wllm = new WatchLLM({
  apiKey: process.env.WATCHLLM_KEY,
});

// Wrap your agent
const traced = wllm.trace(myAgent, {
  depth: 5,
  categories: ['prompt_injection', 'tool_abuse'],
});

// Run a simulation
const result = await wllm.simulate({
  agent: traced,
  runsPerCategory: 10,
});

console.log(result.summary);
// → { pass: 7, fail: 1, critical: 2, score: 0.71 }`;

export default function SDK() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="flex flex-col items-center px-6"
      style={{
        paddingTop: 100,
        paddingBottom: 100,
        background: "#060608",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4 }}
        style={{
          fontSize: 13,
          color: "#00C896",
          fontWeight: 500,
          letterSpacing: "0.05em",
          fontFamily: "var(--font-geist-mono, monospace)",
        }}
      >
        INTEGRATION
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="text-center mt-4"
        style={{
          fontSize: "clamp(28px, 3vw, 40px)",
          fontWeight: 600,
          color: "#EDEDED",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}
      >
        5 lines of code. That&apos;s it.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-center mt-4"
        style={{
          fontSize: 15,
          color: "#666672",
          maxWidth: 440,
          lineHeight: 1.6,
        }}
      >
        Wrap your agent, pick attack categories, run. Works with LangChain,
        CrewAI, custom agents — anything with an API.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="mt-10 w-full"
        style={{ maxWidth: 640 }}
      >
        <div
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
            background: "#0d0d11",
            boxShadow: "0 0 0 1px rgba(0,200,150,0.08), 0 24px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Tab bar */}
          <div
            className="flex items-center px-4"
            style={{
              height: 36,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#EDEDED",
                borderBottom: "1px solid #00C896",
                paddingBottom: 8,
                fontFamily: "var(--font-geist-mono, monospace)",
              }}
            >
              index.ts
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#444450",
                fontFamily: "var(--font-geist-mono, monospace)",
              }}
            >
              config.yml
            </span>
          </div>
          <SyntaxHighlighter
            language="typescript"
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: "16px 20px",
              background: "#0d0d11",
              fontSize: 13,
              lineHeight: 1.7,
              fontFamily: "var(--font-geist-mono, 'Geist Mono', 'Fira Code', monospace)",
            }}
            showLineNumbers
            lineNumberStyle={{
              color: "#333338",
              paddingRight: 16,
              minWidth: "2em",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </motion.div>
    </section>
  );
}
