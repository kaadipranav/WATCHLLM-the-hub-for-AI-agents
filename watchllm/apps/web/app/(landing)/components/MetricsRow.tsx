export default function MetricsRow() {
  return (
    <section className="border-b border-white/5 overflow-hidden">
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5 max-w-7xl mx-auto">
        {[
          { label: "Failures Detected", value: "2M+" },
          { label: "Executions Logged", value: "48M" },
          { label: "Avg Replay Latency", value: "<15ms" },
          { label: "Developer Hours Saved", value: "10k+" }
        ].map((metric, i) => (
          <div key={i} className="flex-1 py-12 px-6 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition">
            <span className="font-mono text-4xl text-accent font-bold mb-2">{metric.value}</span>
            <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">{metric.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
