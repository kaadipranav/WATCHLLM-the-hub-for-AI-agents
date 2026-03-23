import SimulationMockTerminal from "./SimulationMockTerminal";
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative px-6 lg:px-12 pt-24 pb-32 overflow-hidden flex flex-col items-center text-center">
      {/* Background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-mono text-gray-300">v1.0 is live in Early Access</span>
      </div>

      <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl text-white mb-6">
        Your agent works in dev.<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
          WatchLLM makes it work in prod.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
        Stress test with real failures. Replay any run. Fork from any node. The complete continuous evaluation and debugging platform for AI agents.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
        <Link href="/sign-up" className="bg-accent text-black px-6 py-3 rounded-full font-medium hover:bg-accent/90 transition shadow-[0_0_20px_rgba(0,200,150,0.4)]">
          Start testing free
        </Link>
        <Link href="/docs" className="px-6 py-3 rounded-full font-medium text-white border border-white/10 hover:bg-white/5 transition">
          Read the docs
        </Link>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-16 font-mono">
        <span>SOC2 Compliant</span>
        <span className="w-1 h-1 rounded-full bg-gray-600" />
        <span>Open Source SDK</span>
        <span className="w-1 h-1 rounded-full bg-gray-600" />
        <span>Self-hostable</span>
      </div>

      <SimulationMockTerminal />
    </section>
  );
}
