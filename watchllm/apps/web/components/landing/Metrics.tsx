"use client";
import CountUp from "../reactbits/CountUp";

export default function Metrics() {
  return (
    <section className="px-6" style={{ background: "#060608", paddingTop: 80, paddingBottom: 80 }}>
      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4" style={{ maxWidth: 1100 }}>
        <div className="p-6 md:p-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: "clamp(40px, 5vw, 56px)", color: "#00C896", fontWeight: 600 }}>
            <CountUp to={20} from={0} duration={1.5} />+
          </div>
          <div style={{ fontSize: 14, color: "#666672", marginTop: 6 }}>attack categories</div>
        </div>

        <div className="p-6 md:p-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: "clamp(40px, 5vw, 56px)", color: "#00C896", fontWeight: 600 }}>
            &lt; 5 min
          </div>
          <div style={{ fontSize: 14, color: "#666672", marginTop: 6 }}>to first run</div>
        </div>

        <div className="p-6 md:p-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: "clamp(40px, 5vw, 56px)", color: "#00C896", fontWeight: 600 }}>
            <CountUp to={100} from={0} duration={1.5} />%
          </div>
          <div style={{ fontSize: 14, color: "#666672", marginTop: 6 }}>graph coverage</div>
        </div>

        <div className="p-6 md:p-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: "clamp(40px, 5vw, 56px)", color: "#00C896", fontWeight: 600 }}>
            Zero
          </div>
          <div style={{ fontSize: 14, color: "#666672", marginTop: 6 }}>full reruns needed</div>
        </div>
      </div>
    </section>
  );
}
