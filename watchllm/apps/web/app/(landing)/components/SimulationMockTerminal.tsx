export default function SimulationMockTerminal() {
  const rows = [
    "[✓] prompt_injection    severity: 0.82  FAILED",
    "[✓] tool_abuse          severity: 0.21  passed",
    "[✓] role_confusion      severity: 0.08  passed",
    "[...] hallucination     running...",
  ];

  return (
    <div className="w-full max-w-4xl text-left bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-accent/5 font-mono text-sm">
      <div className="bg-[#111] border-b border-white/10 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="ml-4 text-gray-400 text-xs">watchllm simulate --agent my_agent --categories all</div>
      </div>
      
      <div className="p-6 text-gray-300 min-h-[300px] flex flex-col gap-2">
        <div className="text-gray-500 mb-4">$ Initializing simulation runner...</div>
        {rows.map((row, index) => (
          <div
            key={row}
            className={`animate-slide-fade-up flex justify-between opacity-0 [animation-delay:${index * 380}ms]`}
          >
            <span className="text-gray-200">{row}</span>
          </div>
        ))}

      </div>
      
      <div className="bg-[#111] px-6 py-3 border-t border-white/10 flex justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>PROGRESS</span>
          <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="terminal-progress h-full bg-accent" />
          </div>
          <span>2/8 CATEGORIES</span>
        </div>
        <div className="flex gap-4">
          <span className="flex gap-1">
            COST:
            <span className="h-4 overflow-hidden text-gray-200">
              <span className="cost-roll flex flex-col">
                <span>$0.002</span>
                <span>$0.006</span>
                <span>$0.010</span>
                <span>$0.014</span>
              </span>
            </span>
          </span>
          <span>
            LATENCY: <span className="text-gray-300">2.8s</span>
          </span>
        </div>
      </div>
    </div>
  );
}
