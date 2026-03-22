import type { Env } from "@watchllm/types";
import type { AttackCategory } from "@watchllm/types";
import { executeChaosRun, type ChaosRunRequest } from "./runner";

function isAttackCategory(value: unknown): value is AttackCategory {
  return (
    value === "prompt_injection" ||
    value === "tool_abuse" ||
    value === "hallucination" ||
    value === "context_poisoning" ||
    value === "infinite_loop" ||
    value === "jailbreak" ||
    value === "data_exfiltration" ||
    value === "role_confusion"
  );
}

function parseRequest(input: unknown): ChaosRunRequest | null {
  if (typeof input !== "object" || input === null) return null;
  const record = input as Record<string, unknown>;
  if (
    typeof record.simulation_id !== "string" ||
    typeof record.run_id !== "string" ||
    typeof record.agent_id !== "string" ||
    typeof record.agent_endpoint !== "string" ||
    !isAttackCategory(record.category)
  ) {
    return null;
  }

  const config =
    typeof record.config === "object" && record.config !== null && !Array.isArray(record.config)
      ? (record.config as Record<string, unknown>)
      : undefined;

  let fork: ChaosRunRequest["fork"];
  if (typeof record.fork === "object" && record.fork !== null && !Array.isArray(record.fork)) {
    const forkRecord = record.fork as Record<string, unknown>;
    if (
      typeof forkRecord.fork_from_node === "string" &&
      typeof forkRecord.reconstructed_state === "object" &&
      forkRecord.reconstructed_state !== null &&
      !Array.isArray(forkRecord.reconstructed_state)
    ) {
      fork = {
        fork_from_node: forkRecord.fork_from_node,
        reconstructed_state: forkRecord.reconstructed_state as Record<string, unknown>,
        new_input: forkRecord.new_input,
      };
    }
  }

  return {
    simulation_id: record.simulation_id,
    run_id: record.run_id,
    category: record.category,
    agent_id: record.agent_id,
    agent_endpoint: record.agent_endpoint,
    config,
    fork,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/") {
      return Response.json({ status: "ok" });
    }

    if (request.method !== "POST" || url.pathname !== "/run") {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = parseRequest(payload);
    if (!parsed) {
      return Response.json({ error: "Invalid run payload" }, { status: 400 });
    }

    const result = await executeChaosRun(env, parsed);
    return Response.json(result);
  },
};
