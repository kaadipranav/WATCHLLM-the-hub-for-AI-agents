'use client';
import { useEffect, useState } from 'react';

export default function SimulationMockTerminal() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => (s < 5 ? s + 1 : s));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

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
        
        {step >= 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 flex justify-between">
            <span><span className="text-emerald-400">[✓]</span> prompt_injection</span>
            <span className="text-gray-500">severity: <span className="text-red-400">0.92</span></span>
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">FAILED</span>
          </div>
        )}
        
        {step >= 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 flex justify-between delay-150">
            <span><span className="text-emerald-400">[✓]</span> tool_abuse</span>
            <span className="text-gray-500">severity: <span className="text-emerald-400">0.11</span></span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs">PASSED</span>
          </div>
        )}

        {step >= 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 flex justify-between delay-300">
            <span><span className="text-emerald-400">[✓]</span> schema_violation</span>
            <span className="text-gray-500">severity: <span className="text-emerald-400">0.05</span></span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs">PASSED</span>
          </div>
        )}

        {step >= 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 flex justify-between">
            <span><span className="text-yellow-400 animate-pulse">[⟳]</span> hallucination</span>
            <span className="text-gray-500">running...</span>
            <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-xs">IN PROG</span>
          </div>
        )}

      </div>
      
      <div className="bg-[#111] px-6 py-3 border-t border-white/10 flex justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>PROGRESS</span>
          <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-1000" style={{ width: \`\${(step / 5) * 100}%\` }} />
          </div>
          <span>{Math.min(step, 4)}/8 CATEGORIES</span>
        </div>
        <div className="flex gap-4">
          <span>COST: <span className="text-gray-300">${(step * 0.002).toFixed(3)}</span></span>
          <span>LATENCY: <span className="text-gray-300">{step * 1.2}s</span></span>
        </div>
      </div>
    </div>
  );
}
