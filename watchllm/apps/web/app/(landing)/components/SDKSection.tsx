"use client";

import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/github-dark.css";

const sdkSnippet = `import { WatchLLM } from "watchllm";

const watcher = new WatchLLM({ apiKey: process.env.WATCHLLM_KEY! });
export const agent = watcher.wrap(myAgent);`;

export default function SDKSection() {
  const codeRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    hljs.registerLanguage("javascript", javascript);
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, []);

  const onCopy = async () => {
    await navigator.clipboard.writeText(sdkSnippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="px-6 lg:px-12 py-24 bg-[#050505] border-y border-white/5 text-center">
      <h2 className="text-3xl font-bold text-white mb-8">Three lines. Any framework.</h2>
      <div className="max-w-2xl mx-auto text-left relative group">
        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500" />
        <div className="relative bg-[#111] border border-white/10 rounded-xl overflow-hidden p-6 font-mono text-sm shadow-xl">
          <pre className="text-gray-300 pr-20">
            <code ref={codeRef} className="language-javascript">
              {sdkSnippet}
            </code>
          </pre>
          <button
            type="button"
            onClick={onCopy}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs transition"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
      <p className="mt-8 text-gray-500 font-mono text-sm text-center">Three lines. Any framework. CI/CD ready.</p>
    </section>
  );
}
