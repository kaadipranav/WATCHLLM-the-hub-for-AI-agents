export default function ProblemSection() {
  return (
    <section className="px-6 lg:px-12 py-24 bg-[#050505] border-y border-white/5">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white">Agents fail silently</h3>
          <p className="text-gray-400">LLM agents fail in unpredicted ways. By the time users report it, you've already lost trust.</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white">Logs don't replay</h3>
          <p className="text-gray-400">Reading a linear log of LLM calls isn't enough. You need to visualize the execution graph and replay it.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white">Every debug costs money</h3>
          <p className="text-gray-400">Running full runs to reproduce bugs burns tokens. Forking from the exact failure node saves you cash.</p>
        </div>
      </div>
    </section>
  );
}
