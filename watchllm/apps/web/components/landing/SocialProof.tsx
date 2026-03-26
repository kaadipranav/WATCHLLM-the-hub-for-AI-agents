export default function SocialProof() {
  const logos = ["LangChain", "CrewAI", "AutoGen", "OpenAI", "Anthropic"];
  return (
    <section
      className="flex items-center justify-center"
      style={{
        height: 56,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div className="flex items-center gap-5 md:gap-8 px-6 flex-wrap justify-center">
        <span style={{ fontSize: 13, color: "#333338", fontWeight: 500 }}>
          Trusted by engineers building on:
        </span>
        {logos.map((name, i) => (
          <span key={name} className="flex items-center gap-5 md:gap-8">
            {i > 0 && (
              <span
                className="hidden md:inline-block"
                style={{ width: 1, height: 16, background: "rgba(255,255,255,0.06)" }}
              />
            )}
            <span
              style={{
                fontSize: 13,
                color: "#333338",
                fontWeight: 500,
                fontFamily: "var(--font-geist-mono, monospace)",
              }}
            >
              {name}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
