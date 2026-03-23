export default function ForkReplayVisual() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e0e0e] p-5">
      <svg viewBox="0 0 380 180" className="h-44 w-full">
        <circle cx="45" cy="90" r="10" fill="#00C896" />
        <line x1="55" y1="90" x2="120" y2="90" stroke="#4b5563" strokeWidth="2" />

        <circle cx="130" cy="90" r="10" fill="#f6ae2d" />
        <text x="118" y="112" fill="#f6ae2d" fontSize="10" className="font-mono">
          fork
        </text>

        <line x1="140" y1="88" x2="220" y2="48" stroke="#4b5563" strokeWidth="2" />
        <line x1="140" y1="92" x2="220" y2="132" stroke="#4b5563" strokeWidth="2" />

        <circle cx="230" cy="45" r="9" fill="#9ca3af" />
        <circle cx="300" cy="45" r="9" fill="#ff4f5e" />
        <line x1="239" y1="45" x2="291" y2="45" stroke="#4b5563" strokeWidth="2" />
        <text x="245" y="28" fill="#ef4444" fontSize="10" className="font-mono">
          original failed
        </text>

        <circle cx="230" cy="135" r="9" fill="#9ca3af" />
        <circle cx="300" cy="135" r="9" fill="#00C896" />
        <line x1="239" y1="135" x2="291" y2="135" stroke="#4b5563" strokeWidth="2" />
        <text x="247" y="157" fill="#10b981" fontSize="10" className="font-mono">
          fork passed
        </text>
      </svg>
    </div>
  );
}
