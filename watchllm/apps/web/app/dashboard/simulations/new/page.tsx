"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useToast } from "@/components/ToastProvider";
import { apiGet, apiPost, type Agent, type AuthMe } from "@/lib/api";

const categories = [
  "prompt_injection",
  "tool_abuse",
  "hallucination",
  "context_poisoning",
  "infinite_loop",
  "jailbreak",
  "data_exfiltration",
  "role_confusion",
] as const;

const freeAllowed = new Set<string>(["prompt_injection", "tool_abuse", "hallucination"]);

export default function NewSimulationPage() {
  const router = useRouter();
  const { pushError } = useToast();

  const { data: agents } = useSWR("/api/v1/agents", (url: string) => apiGet<Agent[]>(url));
  const { data: me } = useSWR("/api/v1/auth/me", (url: string) => apiGet<AuthMe>(url));

  const [agentId, setAgentId] = useState("");
  const [threshold, setThreshold] = useState("severity < 0.3");
  const [selected, setSelected] = useState<string[]>(["prompt_injection"]);
  const [submitting, setSubmitting] = useState(false);

  const gated = useMemo(() => me?.tier === "free", [me?.tier]);

  const toggle = (category: string) => {
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!agentId) {
      pushError("Select an agent first.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = await apiPost<{ simulation_id: string }>("/api/v1/simulations", {
        agent_id: agentId,
        categories: selected,
        threshold,
      });
      router.push(`/dashboard/simulations/${payload.simulation_id}`);
    } catch (error) {
      pushError(error instanceof Error ? error.message : "Unable to launch simulation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-white/5 bg-[#111] p-6">
      <h1 className="mb-2 text-2xl font-semibold text-white">New simulation</h1>
      <p className="mb-8 text-sm text-gray-400">Launch a stress test run against your registered agent endpoint.</p>

      <form onSubmit={submit} className="space-y-6">
        <label className="block">
          <span className="mb-2 block text-sm text-gray-300">Select agent</span>
          <select
            value={agentId}
            onChange={(event) => setAgentId(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
          >
            <option value="">Choose an agent</option>
            {(agents ?? []).map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>

        <div>
          <p className="mb-2 text-sm text-gray-300">Select categories</p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {categories.map((category) => {
              const isTierGated = gated && !freeAllowed.has(category);
              return (
                <label
                  key={category}
                  className={`flex items-center justify-between rounded border px-3 py-2 text-sm ${
                    isTierGated ? "border-yellow-600/30 bg-yellow-600/10 text-yellow-300" : "border-white/10"
                  }`}
                >
                  <span>{category}</span>
                  <div className="flex items-center gap-2">
                    {isTierGated && <span className="text-[10px] uppercase">pro</span>}
                    <input
                      type="checkbox"
                      checked={selected.includes(category)}
                      onChange={() => toggle(category)}
                      disabled={isTierGated}
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-gray-300">Threshold input</span>
          <input
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
            placeholder="severity < 0.3"
            className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition hover:bg-accent/90 disabled:opacity-60"
        >
          {submitting ? "Launching..." : "Launch simulation"}
        </button>
      </form>
    </div>
  );
}
