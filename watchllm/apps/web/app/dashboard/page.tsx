import Link from 'next/link';

export default function DashboardOverviewPage() {
  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Overview</h1>
        <Link href="/dashboard/simulations/new" className="bg-accent text-black px-4 py-2 rounded-lg font-medium hover:bg-accent/90 transition">
          Run a simulation
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Simulations", value: "24", sub: "This month" },
          { label: "Failures Found", value: "8", sub: "33% failure rate" },
          { label: "Avg Severity", value: "0.72", sub: "High risk" },
          { label: "Monthly Usage", value: "24/500", sub: "Free tier" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111] p-6 rounded-xl border border-white/5">
            <div className="text-gray-400 text-sm mb-2">{stat.label}</div>
            <div className="text-3xl font-mono text-white mb-1">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.sub}</div>
          </div>
        ))}
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Recent Simulations</h2>
      <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0a0a0a] text-gray-400 border-b border-white/5">
            <tr>
              <th className="px-6 py-3 font-medium">Agent</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[1,2,3,4,5].map(i => (
              <tr key={i} className="hover:bg-white/[0.02] transition">
                <td className="px-6 py-4 font-mono text-gray-300">sales_bot_v2</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Completed
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">2 hours ago</td>
                <td className="px-6 py-4">
                  <span className="text-red-400 font-mono">0.84</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
