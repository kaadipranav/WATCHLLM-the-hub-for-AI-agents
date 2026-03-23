export function TierBadge({ tier }: { tier: "free" | "pro" | "team" }) {
  const style =
    tier === "team"
      ? "border-sky-400/30 bg-sky-400/10 text-sky-300"
      : tier === "pro"
        ? "border-accent/40 bg-accent/15 text-accent"
        : "border-gray-500/30 bg-gray-500/10 text-gray-300";

  return (
    <span className={`rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${style}`}>
      {tier}
    </span>
  );
}
