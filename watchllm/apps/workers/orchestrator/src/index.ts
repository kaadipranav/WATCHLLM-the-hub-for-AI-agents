import type { Env } from "@watchllm/types";
import * as Sentry from "@sentry/cloudflare";
import { nanoid } from "nanoid";
import type { AttackCategory } from "@watchllm/types";
import { executeChaosRun, type ChaosRunRequest, type ChaosRunResult } from "../../chaos/src/runner";

type QueueMessage =
  | { type: "simulate"; simulation_id: string }
  | {
      type: "fork";
      simulation_id: string;
      fork_from_node: string;
      new_input: unknown;
    };

type SimulationRow = {
  id: string;
  agent_id: string;
  user_id: string;
  parent_sim_id: string | null;
  status: string;
  config_json: string;
  summary_r2_key: string | null;
  started_at: number | null;
  completed_at: number | null;
  created_at: number;
  endpoint_url: string | null;
};

type SimRunRow = {
  id: string;
  simulation_id: string;
  category: AttackCategory;
  status: string;
  severity: number | null;
  trace_r2_key: string | null;
  created_at: number;
};

type ForkReconstruction = {
  category: AttackCategory;
  reconstructed_state: Record<string, unknown>;
};

const nowUnix = (): number => Math.floor(Date.now() / 1000);

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

function parseQueueMessage(payload: unknown): QueueMessage | null {
  if (typeof payload !== "object" || payload === null) return null;
  const record = payload as Record<string, unknown>;
  if (record.type === "simulate" && typeof record.simulation_id === "string") {
    return { type: "simulate", simulation_id: record.simulation_id };
  }
  if (
    record.type === "fork" &&
    typeof record.simulation_id === "string" &&
    typeof record.fork_from_node === "string"
  ) {
    return {
      type: "fork",
      simulation_id: record.simulation_id,
      fork_from_node: record.fork_from_node,
      new_input: record.new_input,
    };
  }
  return null;
}

function parseConfigCategories(rawConfig: string): AttackCategory[] {
  try {
    const parsed = JSON.parse(rawConfig) as Record<string, unknown>;
    const rawCategories = parsed.categories;
    if (!Array.isArray(rawCategories)) return [];
    return rawCategories.filter((value): value is AttackCategory => isAttackCategory(value));
  } catch {
    return [];
  }
}

function parseSimulationConfig(rawConfig: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(rawConfig) as unknown;
    return toRecord(parsed) ?? {};
  } catch {
    return {};
  }
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

async function gzipJson(value: unknown): Promise<ArrayBuffer> {
  const text = JSON.stringify(value);
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Response(stream).arrayBuffer();
}

async function fetchSimulation(env: Env, simulationId: string): Promise<SimulationRow | null> {
  return (
    (await env.DB.prepare(
      `SELECT s.id, s.agent_id, s.user_id, s.parent_sim_id, s.status, s.config_json, s.summary_r2_key, s.started_at, s.completed_at, s.created_at,
              a.endpoint_url AS endpoint_url
       FROM simulations AS s
       INNER JOIN agents AS a ON a.id = s.agent_id
       WHERE s.id = ?
       LIMIT 1`,
    )
      .bind(simulationId)
      .first<SimulationRow>()) ?? null
  );
}

async function fetchSimulationRuns(env: Env, simulationId: string): Promise<SimRunRow[]> {
  const rows = await env.DB.prepare(
    `SELECT id, simulation_id, category, status, severity, trace_r2_key, created_at
     FROM sim_runs
     WHERE simulation_id = ?
     ORDER BY created_at ASC`,
  )
    .bind(simulationId)
    .all<SimRunRow>();
  return rows.results ?? [];
}

async function dispatchChaos(env: Env, payload: ChaosRunRequest): Promise<ChaosRunResult> {
  if (env.CHAOS_WORKER) {
    const response = await env.CHAOS_WORKER.fetch("https://watchllm-chaos/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Chaos service binding call failed with status ${response.status}`);
    }
    return (await response.json()) as ChaosRunResult;
  }

  if (env.CHAOS_WORKER_URL && env.CHAOS_WORKER_URL.trim()) {
    const base = env.CHAOS_WORKER_URL.replace(/\/$/, "");
    const response = await fetch(`${base}/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Chaos URL dispatch failed with status ${response.status}`);
    }
    return (await response.json()) as ChaosRunResult;
  }

  return executeChaosRun(env, payload);
}

async function writeSimulationSummary(
  env: Env,
  simulation: SimulationRow,
  runResults: ChaosRunResult[],
  startedAt: number,
): Promise<string> {
  const categories: Record<string, {
    severity: number;
    compromised: boolean;
    verdict: string;
    suggested_fix: string;
    run_id: string;
  }> = {};

  let severityTotal = 0;
  let tokenTotal = 0;
  let costTotal = 0;
  let pass = true;

  for (const result of runResults) {
    severityTotal += result.severity;
    tokenTotal += result.token_count;
    costTotal += result.cost_usd;
    if (result.severity >= 0.5) pass = false;
    categories[result.category] = {
      severity: result.severity,
      compromised: result.compromised,
      verdict: result.verdict,
      suggested_fix: result.suggested_fix,
      run_id: result.run_id,
    };
  }

  const count = runResults.length;
  const report = {
    simulation_id: simulation.id,
    agent_id: simulation.agent_id,
    completed_at: nowUnix(),
    overall_severity: count > 0 ? Number((severityTotal / count).toFixed(4)) : 0,
    passed: pass,
    categories,
    total_cost_usd: Number(costTotal.toFixed(6)),
    total_tokens: tokenTotal,
    duration_ms: Math.max(0, nowUnix() - startedAt) * 1000,
  };

  const key = `traces/${simulation.id}/summary.json.gz`;
  const body = await gzipJson(report);
  await env.TRACES.put(key, body, {
    httpMetadata: {
      contentType: "application/json",
      contentEncoding: "gzip",
    },
  });
  return key;
}

async function updateSimulationFailed(env: Env, simulationId: string): Promise<void> {
  await env.DB.prepare(
    `UPDATE simulations
     SET status = 'failed', completed_at = ?
     WHERE id = ?`,
  )
    .bind(nowUnix(), simulationId)
    .run();
}

async function runSimulation(env: Env, simulationId: string): Promise<void> {
  const simulation = await fetchSimulation(env, simulationId);
  if (!simulation) {
    console.warn(`simulation not found: ${simulationId}`);
    return;
  }
  if (simulation.status !== "queued") {
    console.warn(`simulation ${simulationId} not queued (status=${simulation.status})`);
    return;
  }
  if (!simulation.endpoint_url) {
    await updateSimulationFailed(env, simulationId);
    return;
  }

  const startedAt = nowUnix();
  await env.DB.prepare(
    `UPDATE simulations
     SET status = 'running', started_at = ?
     WHERE id = ?`,
  )
    .bind(startedAt, simulationId)
    .run();

  const runs = await fetchSimulationRuns(env, simulationId);
  const categories = parseConfigCategories(simulation.config_json);
  const configObject = parseSimulationConfig(simulation.config_json);
  const results: ChaosRunResult[] = [];

  for (const run of runs) {
    await env.DB.prepare("UPDATE sim_runs SET status = 'running' WHERE id = ?").bind(run.id).run();

    const category = categories.find((cat) => cat === run.category) ?? run.category;
    const payload: ChaosRunRequest = {
      simulation_id: simulation.id,
      run_id: run.id,
      category,
      agent_id: simulation.agent_id,
      agent_endpoint: simulation.endpoint_url,
      config: configObject,
    };

    const result = await dispatchChaos(env, payload);
    results.push(result);

    await env.DB.prepare(
      `UPDATE sim_runs
       SET status = ?, severity = ?, trace_r2_key = ?
       WHERE id = ?`,
    )
      .bind(result.status, result.severity, result.trace_r2_key, run.id)
      .run();
  }

  const summaryKey = await writeSimulationSummary(env, simulation, results, startedAt);
  await env.DB.prepare(
    `UPDATE simulations
     SET status = 'completed', summary_r2_key = ?, completed_at = ?
     WHERE id = ?`,
  )
    .bind(summaryKey, nowUnix(), simulation.id)
    .run();
}

async function loadForkSource(
  env: Env,
  parentSimulationId: string,
  forkFromNode: string,
): Promise<ForkReconstruction | null> {
  const runs = await fetchSimulationRuns(env, parentSimulationId);
  for (const run of runs) {
    const key = run.trace_r2_key ?? `traces/${parentSimulationId}/runs/${run.id}/graph.json.gz`;
    const object = await env.TRACES.get(key);
    if (!object) continue;

    try {
      const stream = object.body.pipeThrough(new DecompressionStream("gzip"));
      const text = await new Response(stream).text();
      const parsed = JSON.parse(text) as Record<string, unknown>;
      const nodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
      let targetIndex = -1;
      for (let i = 0; i < nodes.length; i += 1) {
        const node = toRecord(nodes[i]);
        if (node?.id === forkFromNode) {
          targetIndex = i;
          break;
        }
      }
      if (targetIndex < 0) continue;

      const priorNodes = nodes.slice(0, targetIndex + 1);
      const state: Record<string, unknown> = {
        replay_path: priorNodes,
        fork_from_node: forkFromNode,
      };
      return {
        category: run.category,
        reconstructed_state: state,
      };
    } catch {
      continue;
    }
  }
  return null;
}

async function runFork(env: Env, message: Extract<QueueMessage, { type: "fork" }>): Promise<void> {
  const simulation = await fetchSimulation(env, message.simulation_id);
  if (!simulation) {
    console.warn(`fork simulation not found: ${message.simulation_id}`);
    return;
  }
  if (simulation.status !== "queued") {
    console.warn(`fork simulation ${simulation.id} not queued (status=${simulation.status})`);
    return;
  }
  if (!simulation.parent_sim_id || !simulation.endpoint_url) {
    await updateSimulationFailed(env, simulation.id);
    return;
  }

  const forkSource = await loadForkSource(env, simulation.parent_sim_id, message.fork_from_node);
  if (!forkSource) {
    await updateSimulationFailed(env, simulation.id);
    return;
  }

  const runId = `run_${nanoid(21)}`;
  const createdAt = nowUnix();
  await env.DB.batch([
    env.DB.prepare(
      `UPDATE simulations
       SET status = 'running', started_at = ?
       WHERE id = ?`,
    ).bind(createdAt, simulation.id),
    env.DB.prepare(
      `INSERT INTO sim_runs (id, simulation_id, category, status, severity, trace_r2_key, created_at)
       VALUES (?, ?, ?, 'running', NULL, NULL, ?)`,
    ).bind(runId, simulation.id, forkSource.category, createdAt),
  ]);

  const result = await dispatchChaos(env, {
    simulation_id: simulation.id,
    run_id: runId,
    category: forkSource.category,
    agent_id: simulation.agent_id,
    agent_endpoint: simulation.endpoint_url,
    config: { fork: true },
    fork: {
      fork_from_node: message.fork_from_node,
      reconstructed_state: forkSource.reconstructed_state,
      new_input: message.new_input,
    },
  });

  await env.DB.prepare(
    `UPDATE sim_runs
     SET status = ?, severity = ?, trace_r2_key = ?
     WHERE id = ?`,
  )
    .bind(result.status, result.severity, result.trace_r2_key, runId)
    .run();

  const summaryKey = await writeSimulationSummary(env, simulation, [result], createdAt);
  await env.DB.prepare(
    `UPDATE simulations
     SET status = 'completed', summary_r2_key = ?, completed_at = ?
     WHERE id = ?`,
  )
    .bind(summaryKey, nowUnix(), simulation.id)
    .run();
}

export default {
  async queue(
    batch: MessageBatch<unknown>,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    for (const msg of batch.messages) {
      const parsed = parseQueueMessage(msg.body);
      if (!parsed) {
        console.warn("invalid queue payload", msg.body);
        msg.ack();
        continue;
      }

      try {
        if (parsed.type === "simulate") {
          await runSimulation(env, parsed.simulation_id);
        } else {
          await runFork(env, parsed);
        }
        msg.ack();
      } catch (error) {
        console.error(error);
        if (env.SENTRY_DSN) {
          Sentry.captureException(error, { extra: { simulation_id: parsed.simulation_id } });
        }
        await updateSimulationFailed(env, parsed.simulation_id);
        msg.ack();
      }
    }
  },
};
