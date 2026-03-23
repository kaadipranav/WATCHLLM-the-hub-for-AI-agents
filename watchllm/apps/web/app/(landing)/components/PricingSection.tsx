"use client";

import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import { apiPost } from "@/lib/api";

export default function PricingSection() {
  const { pushError } = useToast();

  const checkout = async (tier: "pro" | "team") => {
    try {
      const payload = await apiPost<{ checkout_url: string }>("/api/v1/billing/checkout", { tier });
      window.location.href = payload.checkout_url;
    } catch (error) {
      pushError(error instanceof Error ? error.message : "Unable to open checkout");
    }
  };

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
            <li>5 simulations / month</li>
            <li>3 attack categories</li>
            <li>7-day artifact retention</li>
            <li>No graph replay or fork</li>
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
          <div className="text-4xl font-bold text-white mb-6">$29<span className="text-lg text-gray-500 font-normal">/mo</span></div>
          <ul className="text-gray-300 text-sm space-y-4 mb-8">
            <li className="font-semibold text-accent">Full graph replay + fork</li>
            <li>100 simulations / month</li>
            <li>All 8 attack categories</li>
            <li>90-day artifact retention</li>
            <li>Priority simulation queue</li>
          </ul>
          <button
            type="button"
            onClick={() => checkout("pro")}
            className="w-full py-2.5 rounded-full bg-accent text-black font-medium hover:bg-accent/90 transition shadow-lg shadow-accent/20"
          >
            Upgrade to Pro
          </button>
        </div>

        {/* Team Tier */}
        <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-white/5 flex flex-col items-center text-center">
          <h3 className="text-xl font-medium text-white mb-2">Team</h3>
          <div className="text-4xl font-bold text-white mb-6">$99<span className="text-lg text-gray-500 font-normal">/mo</span></div>
          <ul className="text-gray-400 text-sm space-y-4 mb-8">
            <li>Everything in Pro</li>
            <li>500 simulations / month</li>
            <li>365-day run history</li>
            <li>10 users, unlimited projects</li>
            <li>Slack notifications</li>
          </ul>
          <button
            type="button"
            onClick={() => checkout("team")}
            className="w-full py-2.5 rounded-full border border-white/10 text-white hover:bg-white/5 transition"
          >
            Get Team
          </button>
        </div>
      </div>
    </section>
  );
}
