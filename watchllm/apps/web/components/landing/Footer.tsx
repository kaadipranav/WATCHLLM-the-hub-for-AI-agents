import Link from "next/link";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#060608", paddingTop: 40, paddingBottom: 40 }} className="px-6">
      <div className="mx-auto" style={{ maxWidth: 1100 }}>
        <div className="flex flex-col md:flex-row md:justify-between" style={{ gap: 28 }}>
          <div>
            <div style={{ fontSize: 17, fontFamily: "var(--font-geist-sans, sans-serif)" }}>
              <span style={{ color: "#EDEDED", fontWeight: 500 }}>Watch</span>
              <span style={{ color: "#00C896", fontWeight: 600 }}>LLM</span>
            </div>
            <div style={{ fontSize: 13, color: "#444450", marginTop: 8 }}>Agent reliability platform</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: 28 }}>
            <div>
              <div style={{ color: "#EDEDED", fontSize: 14, marginBottom: 10 }}>Product</div>
              <div className="space-y-2">
                <div><Link href="/" style={{ color: "#666672", fontSize: 13 }}>Home</Link></div>
                <div><Link href="/changelog" style={{ color: "#666672", fontSize: 13 }}>Changelog</Link></div>
                <div><Link href="/docs" style={{ color: "#666672", fontSize: 13 }}>Status</Link></div>
              </div>
            </div>


            <div>
              <div style={{ color: "#EDEDED", fontSize: 14, marginBottom: 10 }}>Developers</div>
              <div className="space-y-2">
                <div><Link href="/docs" style={{ color: "#666672", fontSize: 13 }}>Docs</Link></div>
                <div><Link href="/docs" style={{ color: "#666672", fontSize: 13 }}>SDK</Link></div>
                <div><Link href="/docs" style={{ color: "#666672", fontSize: 13 }}>CLI</Link></div>
                <div><Link href="https://github.com" style={{ color: "#666672", fontSize: 13 }}>GitHub</Link></div>
              </div>
            </div>

            <div>
              <div style={{ color: "#EDEDED", fontSize: 14, marginBottom: 10 }}>Company</div>
              <div className="space-y-2">
                <div><Link href="/privacy" style={{ color: "#666672", fontSize: 13 }}>Privacy</Link></div>
                <div><Link href="/terms" style={{ color: "#666672", fontSize: 13 }}>Terms</Link></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: "#333338", fontSize: 13 }}>
          <span>© 2025 WatchLLM. Built for engineers who ship agents.</span>
          <div className="flex items-center gap-4">
            <Link href="https://github.com" aria-label="GitHub"><IconBrandGithub size={16} color="#333338" /></Link>
            <Link href="https://x.com" aria-label="X"><IconBrandX size={16} color="#333338" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
