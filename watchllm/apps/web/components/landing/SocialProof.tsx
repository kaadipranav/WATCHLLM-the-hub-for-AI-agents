export default function SocialProof() {
  const frameworks = ["LangChain", "CrewAI", "AutoGen", "OpenAI SDK", "Anthropic SDK"];

  return (
    <div
      style={{
        height: 52,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.015)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        paddingLeft: 24,
        paddingRight: 24,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "#333338",
          marginRight: 24,
          whiteSpace: "nowrap",
        }}
      >
        Works with
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {frameworks.map((fw, i) => (
          <span key={fw} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <span
                style={{
                  width: 1,
                  height: 14,
                  background: "rgba(255,255,255,0.08)",
                  display: "inline-block",
                  margin: "0 18px",
                }}
              />
            )}
            <span
              style={{
                fontFamily: "var(--font-geist-mono, monospace)",
                fontSize: 13,
                color: "#444450",
                whiteSpace: "nowrap",
              }}
            >
              {fw}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
