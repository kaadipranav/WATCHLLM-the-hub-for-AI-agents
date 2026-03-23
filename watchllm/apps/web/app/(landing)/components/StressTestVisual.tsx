export default function StressTestVisual() {
  const categories = [
    { name: "prompt_injection", state: "danger" },
    { name: "tool_abuse", state: "safe" },
    { name: "hallucination", state: "danger" },
    { name: "context_poisoning", state: "safe" },
    { name: "jailbreak", state: "danger" },
    { name: "role_confusion", state: "safe" },
    { name: "infinite_loop", state: "safe" },
    { name: "data_exfiltration", state: "danger" },
  ] as const;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e0e0e] p-5">
      <div className="mb-4 text-xs uppercase tracking-[0.2em] text-gray-500">attack matrix</div>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category, index) => (
          <div
            key={category.name}
            className={`animate-slide-fade-up rounded-full border px-3 py-2 font-mono text-xs opacity-0 [animation-delay:${index * 140}ms] ${
              category.state === "danger"
                ? "border-red-400/50 bg-red-500/10 text-red-300 shadow-[0_0_14px_rgba(255,79,94,0.25)]"
                : "border-emerald-400/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_14px_rgba(0,200,150,0.2)]"
            }`}
          >
            {category.name}
          </div>
        ))}
      </div>
    </div>
  );
}
