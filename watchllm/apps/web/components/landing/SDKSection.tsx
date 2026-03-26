"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";

const DynamicSyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((m) => m.Prism),
  { ssr: false, loading: () => <pre style={{ minHeight: 220, color: "#444450", padding: 16 }}>Loading code preview...</pre> }
);

const pythonCode = `from watchllm import test

@test(
    categories=["prompt_injection", "tool_abuse"],
    threshold="severity < 0.3"
)
def my_agent(user_input: str) -> str:
    # your agent stays exactly as-is
    return agent.run(user_input)`;

const cliCode = `# install
pip install watchllm

# run in CI
watchllm simulate \
  --agent src.agent.run \
  --categories all \
  --threshold "severity < 0.3"

# exit 1 if threshold exceeded`;

export default function SDKSection() {
  const [tab, setTab] = useState<"python" | "cli">("python");
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => (tab === "python" ? pythonCode : cliCode), [tab]);

  const customStyle = useMemo(
    () => ({
      margin: 0,
      background: "transparent",
      fontSize: 13,
      lineHeight: 1.7,
      fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
      padding: "14px 16px",
      color: "#EDEDED",
      minHeight: 220,
    }),
    []
  );

  return (
    <section
      style={{
        background: "rgba(255,255,255,0.02)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingTop: 100,
        paddingBottom: 100,
      }}
      className="px-6"
    >
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2 items-start" style={{ maxWidth: 800, gap: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: "#00C896", letterSpacing: "0.12em", fontWeight: 500 }}>INTEGRATE IN MINUTES</div>
          <h3 style={{ fontSize: "clamp(30px, 4vw, 44px)", color: "#EDEDED", fontWeight: 600, marginTop: 10 }}>Three lines of code.</h3>
          <p style={{ fontSize: 16, color: "#666672", lineHeight: 1.7, marginTop: 14 }}>
            Works with LangChain, CrewAI, AutoGen, raw OpenAI — anything callable. Drop the decorator, run the CLI, get a
            reliability report.
          </p>
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, background: "#0b0b0f", overflow: "hidden" }}>
          <div className="flex items-center justify-between px-4" style={{ height: 42, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-4">
              <button onClick={() => setTab("python")} style={{ fontSize: 13, color: tab === "python" ? "#00C896" : "#444450", borderBottom: tab === "python" ? "1px solid #00C896" : "1px solid transparent", height: 42 }}>
                Python
              </button>
              <button onClick={() => setTab("cli")} style={{ fontSize: 13, color: tab === "cli" ? "#00C896" : "#444450", borderBottom: tab === "cli" ? "1px solid #00C896" : "1px solid transparent", height: 42 }}>
                CLI
              </button>
            </div>

            <button
              onClick={async () => {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              style={{ color: "#666672" }}
              aria-label="copy code"
            >
              {copied ? <IconCheck size={16} color="#00C896" /> : <IconCopy size={16} />}
            </button>
          </div>

          <DynamicSyntaxHighlighter
            language={tab === "python" ? "python" : "bash"}
            style={{
              'pre[class*="language-"]': { background: "transparent" },
              'code[class*="language-"]': { color: "#EDEDED" },
              keyword: { color: "#7B61FF" },
              string: { color: "#00C896" },
              comment: { color: "#444450" },
              decorator: { color: "#F59E0B" },
            }}
            customStyle={customStyle}
            showLineNumbers
            lineNumberStyle={{ color: "#333338", minWidth: "2em", paddingRight: 10 }}
          >
            {code}
          </DynamicSyntaxHighlighter>
        </div>
      </div>
    </section>
  );
}
