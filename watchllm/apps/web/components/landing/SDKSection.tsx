"use client";
import { Suspense, lazy, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { IconCopy, IconCheck } from "@tabler/icons-react";

const SyntaxHighlighter = lazy(() => import("react-syntax-highlighter").then(m => ({ default: m.Prism })));

const PYTHON_CODE = `from watchllm import test

@test(
    categories=["prompt_injection", "tool_abuse"],
    threshold="severity < 0.3"
)
def my_agent(user_input: str) -> str:
    # your existing agent — no changes needed
    return agent.run(user_input)`;

const CLI_CODE = `# install
pip install watchllm

# authenticate
watchllm auth login

# run in CI/CD  
watchllm simulate \\
  --agent src.agent.run \\
  --categories all \\
  --threshold "severity < 0.3"

# exits 1 if threshold exceeded`;

const FRAMEWORKS = ["LangChain", "CrewAI", "AutoGen", "OpenAI", "Anthropic"];

export default function SDKSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [tab, setTab] = useState<"python" | "cli">("python");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tab === "python" ? PYTHON_CODE : CLI_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      ref={ref}
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
        paddingTop: 96,
        paddingBottom: 96,
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
        <div className="grid grid-cols-1 md:grid-cols-[38%_62%] items-center" style={{ gap: 64 }}>
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span style={{ fontSize: 11, fontWeight: 500, color: "#00C896", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
              Integrate
            </span>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 600, color: "#EDEDED", letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                Three lines.
              </div>
              <div style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 600, color: "#00C896", letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                Any framework.
              </div>
            </div>
            <p style={{ fontSize: 15, color: "#666672", lineHeight: 1.7, marginTop: 16 }}>
              Works with LangChain, CrewAI, AutoGen, raw OpenAI — anything callable as a Python function.
              One decorator. Results in 5 minutes.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
              {FRAMEWORKS.map((fw) => (
                <span
                  key={fw}
                  style={{
                    fontFamily: "var(--font-geist-mono, monospace)",
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#444450",
                  }}
                >
                  {fw}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right code block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {/* Tab bar */}
            <div
              style={{
                height: 38,
                paddingLeft: 16,
                paddingRight: 16,
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", height: "100%" }}>
                {(["python", "cli"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      height: "100%",
                      paddingLeft: 14,
                      paddingRight: 14,
                      fontFamily: "var(--font-geist-mono, monospace)",
                      fontSize: 13,
                      background: "transparent",
                      border: "none",
                      borderBottom: tab === t ? "2px solid #00C896" : "2px solid transparent",
                      color: tab === t ? "#EDEDED" : "#444450",
                      cursor: "pointer",
                      transition: "color 150ms ease",
                    }}
                    onMouseEnter={(e) => { if (tab !== t) e.currentTarget.style.color = "#666672"; }}
                    onMouseLeave={(e) => { if (tab !== t) e.currentTarget.style.color = "#444450"; }}
                  >
                    {t === "python" ? "Python" : "CLI"}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopy}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: copied ? "#00C896" : "#444450", transition: "color 150ms ease", padding: 4 }}
                onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = "#EDEDED"; }}
                onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = "#444450"; }}
              >
                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              </button>
            </div>

            {/* Code area */}
            <div style={{ padding: "20px 24px", background: "rgba(8,8,12,0.8)" }}>
              <Suspense fallback={
                <pre style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 13, color: "#666672", margin: 0, lineHeight: 1.8 }}>
                  {tab === "python" ? PYTHON_CODE : CLI_CODE}
                </pre>
              }>
                <SyntaxHighlighter
                  language={tab === "python" ? "python" : "bash"}
                  customStyle={{ background: "transparent", margin: 0, padding: 0, fontSize: 13, lineHeight: 1.8 }}
                  codeTagProps={{ style: { fontFamily: "var(--font-geist-mono, monospace)" } }}
                >
                  {tab === "python" ? PYTHON_CODE : CLI_CODE}
                </SyntaxHighlighter>
              </Suspense>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
