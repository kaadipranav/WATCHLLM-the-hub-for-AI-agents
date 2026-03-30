export const runtime = 'edge';
"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import {
  apiGet,
  apiPost,
  type AuthMe,
  type SimRun,
  type SimulationDetailPayload,
  type SimulationStatusPayload,
} from "@/lib/api";
import { StatusBadge } from "../../components/StatusBadge";

type ReplayNode = {
  id: string;
  type: string;
  timestamp?: number;
  output?: unknown;
};

type ReplayEdge = {
  from: string;
  to: string;
};

function extractGraph(value: unknown): { nodes: ReplayNode[]; edges: ReplayEdge[] } {
  if (!value || typeof value !== "object") return { nodes: [], edges: [] };
  const record = value as Record<string, unknown>;
  const nodes = Array.isArray(record.nodes)
    ? (record.nodes.filter((item) => typeof item === "object" && item !== null) as ReplayNode[])
    : [];
  const edges = Array.isArray(record.edges)
    ? (record.edges.filter((item) => typeof item === "object" && item !== null) as ReplayEdge[])
    : [];
  return { nodes, edges };
}

export default function SimulationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { pushError, pushSuccess } = useToast();

  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [forkModalOpen, setForkModalOpen] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [forkFromNode, setForkFromNode] = useState("");
  const [forkInput, setForkInput] = useState("{}");
  const [versionMessage, setVersionMessage] = useState("Improve failure handling");

  const detail = useSWR(`/api/v1/simulations/${id}`, (url: string) => apiGet<SimulationDetailPayload>(url), {
    refreshInterval: 3000,
  });
  const status = useSWR(
    `/api/v1/simulations/${id}/status`,
    (url: string) => apiGet<SimulationStatusPayload>(url),
    { refreshInterval: 3000 },
  );
  const me = useSWR("/api/v1/auth/me", (url: string) => apiGet<AuthMe>(url));

  const runs = detail.data?.sim_runs ?? [];
  const simulationStatus = status.data?.status ?? detail.data?.simulation.status ?? "queued";
  const completed = simulationStatus === "completed" || simulationStatus === "failed";

  const activeRunId = selectedRunId || runs[0]?.id || "";
  const replay = useSWR(
    completed && me.data?.tier !== "free" && activeRunId
      ? `/api/v1/simulations/${id}/replay/${activeRunId}`
      : null,
    (url: string) => apiGet<unknown>(url),
  );

  const graph = useMemo(() => extractGraph(replay.data), [replay.data]);

  const launchFork = async () => {
    try {
      const parsed = JSON.parse(forkInput) as unknown;
      const payload = await apiPost<{ simulation_id: string }>(`/api/v1/simulations/${id}/fork`, {
        fork_from_node: forkFromNode,
        new_input: parsed,
      });
      pushSuccess("Fork queued successfully.");
      setForkModalOpen(false);
      router.push(`/dashboard/simulations/${payload.simulation_id}`);
    } catch (error) {
      pushError(error instanceof Error ? error.message : "Unable to fork simulation");
    }
  };

  const saveVersion = async () => {
    try {
      await apiPost(`/api/v1/agents/${detail.data?.simulation.agent_id}/versions`, {
        simulation_id: id,
        message: versionMessage,
        branch: "main",
      });
      pushSuccess("Saved as version.");
      setVersionModalOpen(false);
    } catch (error) {
      pushError(error instanceof Error ? error.message : "Unable to save version");
    }
  };

  if (!detail.data || !status.data) {
    return <div className="text-sm text-gray-400">Loading simulation...</div>;
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Simulation {id}</h1>
        <StatusBadge status={simulationStatus} />
      </div>

      {!completed ? (
        <section className="rounded-xl border border-white/5 bg-[#111] p-5">
          <div className="mb-4 flex items-center justify-between text-sm text-gray-400">
            <p>Running simulation</p>
            <p>
              {status.data.completed_runs}/{status.data.total_runs} categories complete
            </p>
          </div>
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${(status.data.completed_runs / Math.max(status.data.total_runs, 1)) * 100}%` }}
            />
          </div>

          <table className="w-full text-left text-sm">
            <thead className="text-gray-400">
              <tr>
                <th className="py-2">Category</th>
                <th className="py-2">Status</th>
                <th className="py-2">Severity</th>
                <th className="py-2">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {runs.map((run) => (
                <tr key={run.id}>
                  <td className="py-3 font-mono text-xs">{run.category}</td>
                  <td className="py-3">
                    {run.status === "running" ? (
                      <span className="inline-flex items-center gap-2 text-amber-300">
                        <span className="h-2 w-2 animate-spin rounded-full border border-amber-300 border-t-transparent" />
                        running
                      </span>
                    ) : (
                      <StatusBadge status={run.status} />
                    )}
                  </td>
                  <td className="py-3 font-mono text-xs text-gray-300">{run.severity?.toFixed(2) ?? "-"}</td>
                  <td className="py-3 text-xs text-gray-300">
                    {run.severity === null ? "pending" : run.severity >= 0.6 ? "fail" : "pass"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="relative col-span-3 rounded-xl border border-white/5 bg-[#111] p-5">
            <h2 className="mb-4 text-lg font-semibold">Graph replay</h2>
            {me.data?.tier === "free" ? (
              <div className="absolute inset-4 flex items-center justify-center rounded-xl border border-white/10 bg-black/70 text-center">
                <div>
                  <p className="mb-3 text-sm text-gray-200">Upgrade to Pro to replay this run</p>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/settings")}
                    className="rounded-md bg-accent px-3 py-2 text-xs font-medium text-black"
                  >
                    Upgrade now
                  </button>
                </div>
              </div>
            ) : (
              <>
                <svg viewBox="0 0 680 320" className="h-[320px] w-full rounded-lg border border-white/10 bg-[#0d0d0d]">
                  {graph.edges.map((edge) => {
                    const from = graph.nodes.find((node) => node.id === edge.from);
                    const to = graph.nodes.find((node) => node.id === edge.to);
                    if (!from || !to) return null;
                    const fromIndex = graph.nodes.indexOf(from);
                    const toIndex = graph.nodes.indexOf(to);
                    const x1 = 70 + fromIndex * 110;
                    const x2 = 70 + toIndex * 110;
                    const y1 = 160 + (fromIndex % 2 === 0 ? -30 : 30);
                    const y2 = 160 + (toIndex % 2 === 0 ? -30 : 30);
                    return <line key={`${edge.from}_${edge.to}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4b5563" />;
                  })}
                  {graph.nodes.map((node, index) => {
                    const x = 70 + index * 110;
                    const y = 160 + (index % 2 === 0 ? -30 : 30);
                    const selected = selectedNodeId === node.id;
                    const color =
                      node.type === "failure"
                        ? "#ff4f5e"
                        : node.type === "tool_call"
                          ? "#14b8a6"
                          : "#8b5cf6";
                    return (
                      <g key={node.id} onClick={() => setSelectedNodeId(node.id)} className="cursor-pointer">
                        <circle cx={x} cy={y} r={selected ? 14 : 11} fill={color} />
                        <text x={x - 28} y={y + 25} fill="#cbd5e1" fontSize="10" className="font-mono">
                          {node.type}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <input type="range" min={0} max={Math.max(graph.nodes.length - 1, 0)} className="mt-3 h-1 w-full" />
              </>
            )}
          </div>

          <div className="col-span-2 rounded-xl border border-white/5 bg-[#111] p-5">
            <h2 className="mb-4 text-lg font-semibold">Inspector</h2>
            <div className="mb-4 rounded-lg border border-white/10 bg-black/30 p-3 text-sm">
              <p className="text-gray-400">Overall severity score</p>
              <p className="font-mono text-2xl text-accent">
                {Object.values(status.data.severity_by_category).length === 0
                  ? "0.00"
                  : (
                      Object.values(status.data.severity_by_category).reduce((sum, value) => sum + value, 0) /
                      Object.values(status.data.severity_by_category).length
                    ).toFixed(2)}
              </p>
            </div>

            <table className="mb-4 w-full text-left text-xs">
              <thead className="text-gray-400">
                <tr>
                  <th className="py-2">Category</th>
                  <th className="py-2">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {runs.map((run: SimRun) => (
                  <tr key={run.id}>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRunId(run.id)}
                        className={`font-mono transition ${activeRunId === run.id ? "text-accent" : "text-gray-300"}`}
                      >
                        {run.category}
                      </button>
                    </td>
                    <td className="py-2 font-mono text-gray-200">{run.severity?.toFixed(2) ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={me.data?.tier === "free"}
                onClick={() => {
                  setForkFromNode(selectedNodeId || graph.nodes[0]?.id || "");
                  setForkModalOpen(true);
                }}
                className="rounded-md border border-white/10 px-3 py-2 text-xs transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Fork
              </button>
              <button
                type="button"
                onClick={() => setVersionModalOpen(true)}
                className="rounded-md border border-white/10 px-3 py-2 text-xs transition hover:bg-white/5"
              >
                Save as version
              </button>
            </div>
          </div>
        </section>
      )}

      {forkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#111] p-5">
            <h3 className="mb-3 text-lg font-semibold">Fork and replay</h3>
            <label className="mb-3 block text-sm text-gray-300">
              Node id
              <input
                value={forkFromNode}
                onChange={(event) => setForkFromNode(event.target.value)}
                className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm"
              />
            </label>
            <label className="mb-4 block text-sm text-gray-300">
              New input
              <textarea
                value={forkInput}
                onChange={(event) => setForkInput(event.target.value)}
                className="mt-1 h-28 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setForkModalOpen(false)} className="rounded border border-white/10 px-3 py-2 text-xs">
                Cancel
              </button>
              <button type="button" onClick={launchFork} className="rounded bg-accent px-3 py-2 text-xs font-medium text-black">
                Fork and replay
              </button>
            </div>
          </div>
        </div>
      )}

      {versionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#111] p-5">
            <h3 className="mb-3 text-lg font-semibold">Save as version</h3>
            <label className="mb-4 block text-sm text-gray-300">
              Commit message
              <input
                value={versionMessage}
                onChange={(event) => setVersionMessage(event.target.value)}
                className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setVersionModalOpen(false)} className="rounded border border-white/10 px-3 py-2 text-xs">
                Cancel
              </button>
              <button type="button" onClick={saveVersion} className="rounded bg-accent px-3 py-2 text-xs font-medium text-black">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
