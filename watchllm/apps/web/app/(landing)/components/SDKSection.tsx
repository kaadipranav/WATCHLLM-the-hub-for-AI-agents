export default function SDKSection() {
  return (
    <section className="px-6 lg:px-12 py-24 bg-[#050505] border-y border-white/5 text-center">
      <h2 className="text-3xl font-bold text-white mb-8">Three lines. Any framework.</h2>
      <div className="max-w-2xl mx-auto text-left relative group">
        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500" />
        <div className="relative bg-[#111] border border-white/10 rounded-xl overflow-hidden p-6 font-mono text-sm shadow-xl">
          <pre className="text-gray-300">
            <code>
              <span className="text-pink-400">import</span> {'{ '}WatchLLM{' }'} <span className="text-pink-400">from</span> <span className="text-green-300">'watchllm-sdk'</span>;{'\n\n'}
              <span className="text-pink-400">const</span> watcher = <span className="text-pink-400">new</span> WatchLLM(<span className="text-green-300">'api_key'</span>);{'\n'}
              <span className="text-gray-500">// Wrap your agent</span>{'\n'}
              <span className="text-pink-400">export default</span> watcher.wrap(myAgentProcess);
            </code>
          </pre>
          <button className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs transition">Copy</button>
        </div>
      </div>
      <p className="mt-8 text-gray-500 font-mono text-sm text-center">Drop-in support for LangChain, AutoGen, and raw completions.</p>
    </section>
  );
}
