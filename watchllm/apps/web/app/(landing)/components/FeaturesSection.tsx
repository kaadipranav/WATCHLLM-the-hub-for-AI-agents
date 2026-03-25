import ForkReplayVisual from "./ForkReplayVisual";
import GraphReplayVisual from "./GraphReplayVisual";
import StressTestVisual from "./StressTestVisual";

export default function FeaturesSection() {
  return (
    <section id="features" className="px-6 lg:px-12 py-32 flex flex-col gap-32 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">Adversarial Stress Testing</h2>
          <p className="text-gray-400 text-lg">WatchLLM continuously hammers your agent with 8 different categories of attacks, simulating everything from malicious prompt injections to silent schema violations.</p>
        </div>
        <div className="aspect-video">
          <StressTestVisual />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-16 items-center flex-row-reverse">
        <div className="aspect-video md:order-first">
          <GraphReplayVisual />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">Execution Graph Replay</h2>
          <p className="text-gray-400 text-lg">Don&apos;t guess where it broke. Replay the exact execution trace node-by-node. See every LLM decision, latency penalty, and tool call payload.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">Time-Travel Forking</h2>
          <p className="text-gray-400 text-lg">Found the failure node? Don&apos;t restart the whole agent. Edit the prompt or the tool output right at that step and branch the execution state.</p>
        </div>
        <div className="aspect-video">
          <ForkReplayVisual />
        </div>
      </div>
    </section>
  );
}
