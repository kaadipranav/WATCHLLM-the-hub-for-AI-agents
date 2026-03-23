import Link from 'next/link';

export default function PricingSection() {
  return (
    <section id="pricing" className="px-6 lg:px-12 py-32 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Predictable pricing for any scale</h2>
        <p className="text-gray-400 text-lg">Start for free. Pay when your agent goes to production.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Free Tier */}
        <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-white/5 flex flex-col items-center text-center">
          <h3 className="text-xl font-medium text-white mb-2">Free</h3>
          <div className="text-4xl font-bold text-white mb-6">$0<span className="text-lg text-gray-500 font-normal">/mo</span></div>
          <ul className="text-gray-400 text-sm space-y-4 mb-8">
            <li>500 simulations / month</li>
            <li>Basic templates (injection, schema)</li>
            <li>7-day artifact retention</li>
            <li>Community support</li>
          </ul>
          <Link href="/sign-up" className="w-full py-2.5 rounded-full border border-white/10 text-white hover:bg-white/5 transition">
            Get started free
          </Link>
        </div>

        {/* Pro Tier (Most Popular) */}
        <div className="bg-[#111] rounded-2xl p-8 border border-accent relative ring-1 ring-accent/50 shadow-[0_0_30px_rgba(0,200,150,0.15)] flex flex-col items-center text-center -translate-y-4">
          <div className="absolute top-0 -translate-y-1/2 bg-accent text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Most Popular
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Pro</h3>
          <div className="text-4xl font-bold text-white mb-6">$49<span className="text-lg text-gray-500 font-normal">/mo</span></div>
          <ul className="text-gray-300 text-sm space-y-4 mb-8">
            <li className="font-semibold text-accent">Node-level execution forking</li>
            <li>Unlimited simulations</li>
            <li>All attack templates (auth, multi-hop)</li>
            <li>90-day artifact retention</li>
            <li>Priority email support</li>
          </ul>
          <Link href="/sign-up" className="w-full py-2.5 rounded-full bg-accent text-black font-medium hover:bg-accent/90 transition shadow-lg shadow-accent/20">
            Upgrade to Pro
          </Link>
        </div>

        {/* Team Tier */}
        <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-white/5 flex flex-col items-center text-center">
          <h3 className="text-xl font-medium text-white mb-2">Team</h3>
          <div className="text-4xl font-bold text-white mb-6">$199<span className="text-lg text-gray-500 font-normal">/mo</span></div>
          <ul className="text-gray-400 text-sm space-y-4 mb-8">
            <li>Everything in Pro</li>
            <li>Role-based access control (RBAC)</li>
            <li>1-year artifact retention</li>
            <li>Custom deployment options</li>
            <li>Dedicated Slack channel</li>
          </ul>
          <Link href="/sign-up" className="w-full py-2.5 rounded-full border border-white/10 text-white hover:bg-white/5 transition">
            Get Team
          </Link>
        </div>
      </div>
    </section>
  );
}
