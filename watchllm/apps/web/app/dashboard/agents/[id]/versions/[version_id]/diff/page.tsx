"use client";
export const runtime = 'edge';
import { useParams } from "next/navigation";
import useSWR from "swr";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

type DiffNode = {
  id?: string;
  type?: string;
};

type DiffPayload = {
  added_nodes?: DiffNode[];
  removed_nodes?: DiffNode[];
  changed_nodes?: DiffNode[];
  previous_graph?: { nodes?: DiffNode[] };
  current_graph?: { nodes?: DiffNode[] };
  severity_delta?: number;
};

export default function VersionDiffPage() {
  const params = useParams<{ id: string; version_id: string }>();
  const { pushError } = useToast();

  const diff = useSWR(
    `/api/v1/agents/${params.id}/versions/${params.version_id}/diff`,
    (url: string) => apiGet<DiffPayload>(url),
  );

  const restore = async () => {
    try {
      await apiPost<{ simulation_id: string }>("/api/v1/simulations", {
        agent_id: params.id,
        categories: ["prompt_injection", "tool_abuse", "hallucination"],
        threshold: "severity < 0.3",
        config: { restore_version: params.version_id },
      });
    } catch (error) {
      pushError(error instanceof Error ? error.message : "Unable to restore this version");
    }
  };

  const data = diff.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Version diff</h1>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-[#111] p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-300">Previous graph</h2>
          <div className="space-y-2">
            {(data?.previous_graph?.nodes ?? []).map((node, index) => (
              <div key={`${node.id ?? "node"}_${index}`} className="rounded border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {node.type ?? "node"}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#111] p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-300">Current graph</h2>
          <div className="space-y-2">
            {(data?.current_graph?.nodes ?? []).map((node, index) => (
              <div key={`${node.id ?? "node"}_${index}`} className="rounded border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                {node.type ?? "node"}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-[#111] p-4">
        <h3 className="mb-2 text-sm font-medium">Severity delta summary</h3>
        <p className="font-mono text-sm text-gray-300">{data?.severity_delta?.toFixed(2) ?? "0.00"}</p>
      </div>

      <button type="button" onClick={restore} className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5">
        Restore this version
      </button>
    </div>
  );
}
