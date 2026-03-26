import Link from "next/link";
import { IconCheck, IconX } from "@tabler/icons-react";

const baseCard = {
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.02)",
  padding: 28,
};

export default function Pricing() {
  return (
    <section id="pricing" className="px-6" style={{ background: "#060608", paddingTop: 100, paddingBottom: 100 }}>
      <div className="mx-auto" style={{ maxWidth: 900 }}>
        <div className="text-center">
          <div style={{ fontSize: 11, color: "#00C896", letterSpacing: "0.12em", fontWeight: 500 }}>PRICING</div>
          <h3 style={{ fontSize: "clamp(32px, 4vw, 44px)", color: "#EDEDED", fontWeight: 600, marginTop: 10 }}>Start free. Upgrade when you need to.</h3>
          <p style={{ fontSize: 14, color: "#666672", marginTop: 8 }}>No contracts. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          <div style={baseCard}>
            <h4 style={{ color: "#EDEDED", fontWeight: 600 }}>Free</h4>
            <div style={{ fontSize: 34, color: "#EDEDED", marginTop: 8, fontWeight: 600 }}>$0 / month</div>
            <ul className="mt-6 space-y-2">
              {["5 simulations / month", "3 attack categories", "CI/CD integration", "7-day history"].map((f) => (
                <li key={f} className="flex items-center gap-2" style={{ color: "#666672", fontSize: 14 }}><IconCheck size={16} color="#00C896" />{f}</li>
              ))}
              {["Graph replay", "Fork & replay", "Version history"].map((f) => (
                <li key={f} className="flex items-center gap-2" style={{ color: "#333338", fontSize: 14 }}><IconX size={16} color="#333338" />{f}</li>
              ))}
            </ul>
            <Link href="/sign-up" className="inline-flex items-center justify-center w-full mt-7" style={{ height: 40, borderRadius: 7, border: "1px solid rgba(255,255,255,0.12)", color: "#EDEDED", fontSize: 14 }}>
              Get started free
            </Link>
          </div>

          <div style={{ ...baseCard, border: "1px solid rgba(0,200,150,0.3)", background: "rgba(0,200,150,0.04)", position: "relative" }}>
            <div style={{ position: "absolute", right: 18, top: 18, fontSize: 11, color: "#00C896", border: "1px solid rgba(0,200,150,0.3)", background: "rgba(0,200,150,0.1)", borderRadius: 9999, padding: "4px 10px", fontWeight: 600 }}>
              Most popular
            </div>
            <h4 style={{ color: "#EDEDED", fontWeight: 600 }}>Pro</h4>
            <div style={{ fontSize: 34, color: "#EDEDED", marginTop: 8, fontWeight: 600 }}>$29 / month</div>
            <ul className="mt-6 space-y-2">
              {["100 simulations / month", "All 8 attack categories", "Full graph replay", "Fork & replay", "90-day history", "1 seat"].map((f) => (
                <li key={f} className="flex items-center gap-2" style={{ color: "#666672", fontSize: 14 }}><IconCheck size={16} color="#00C896" />{f}</li>
              ))}
            </ul>
            <form method="POST" action="/api/v1/billing/checkout" className="mt-7">
              <input type="hidden" name="plan" value="pro" />
              <button type="submit" className="w-full" style={{ height: 40, borderRadius: 7, background: "#00C896", color: "#060608", fontWeight: 600, boxShadow: "0 0 18px rgba(0,200,150,0.25)" }}>
                Upgrade to Pro
              </button>
            </form>
          </div>

          <div style={baseCard}>
            <h4 style={{ color: "#EDEDED", fontWeight: 600 }}>Team</h4>
            <div style={{ fontSize: 34, color: "#EDEDED", marginTop: 8, fontWeight: 600 }}>$99 / month</div>
            <ul className="mt-6 space-y-2">
              {["500 simulations / month", "10 seats", "365-day history", "Slack notifications", "Priority queue"].map((f) => (
                <li key={f} className="flex items-center gap-2" style={{ color: "#666672", fontSize: 14 }}><IconCheck size={16} color="#00C896" />{f}</li>
              ))}
            </ul>
            <form method="POST" action="/api/v1/billing/checkout" className="mt-7">
              <input type="hidden" name="plan" value="team" />
              <button type="submit" className="w-full" style={{ height: 40, borderRadius: 7, background: "#00C896", color: "#060608", fontWeight: 600 }}>
                Get Team
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
