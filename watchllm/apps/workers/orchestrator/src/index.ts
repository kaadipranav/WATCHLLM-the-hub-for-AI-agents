import type { Env } from "@watchllm/types";
import * as Sentry from "@sentry/cloudflare";
import { nanoid } from "nanoid";
import type { AttackCategory } from "@watchllm/types";
import type { GraphNode } from "@watchllm/types";
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

type BranchRow = {
  id: string;
  agent_id: string;
  name: string;
  head_version_id: string | null;
  created_at: number;
};

type VersionRow = {
  id: string;
  simulation_id: string;
  parent_version_id: string | null;
  branch_name: string;
  commit_message: string | null;
  diff_summary: string | null;
  overall_severity: number | null;
  created_at: number;
};

type GraphDiff = {
  added_nodes: GraphNode[];
  removed_nodes: GraphNode[];
  changed_nodes: Array<{ before: GraphNode; after: GraphNode }>;
  severity_delta: number;
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

function safeJsonString(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "null";
  }
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
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

async function readRunGraph(
  env: Env,
  simulationId: string,
  runId: string,
  traceR2Key: string | null,
): Promise<GraphNode[]> {
  const key = traceR2Key ?? `traces/${simulationId}/runs/${runId}/graph.json.gz`;
  const object = await env.TRACES.get(key);
  if (!object) return [];
  try {
    const stream = object.body.pipeThrough(new DecompressionStream("gzip"));
    const text = await new Response(stream).text();
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const rawNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
    const nodes: GraphNode[] = [];
    for (const rawNode of rawNodes) {
      const node = toRecord(rawNode);
      if (!node) continue;
      if (typeof node.id !== "string") continue;
      if (typeof node.type !== "string") continue;
      nodes.push({
        id: node.id,
        parent_id: typeof node.parent_id === "string" ? node.parent_id : null,
        type: node.type as GraphNode["type"],
        input: node.input,
        output: node.output,
        timestamp: parseNumber(node.timestamp) ?? nowUnix(),
        latency_ms: parseNumber(node.latency_ms) ?? 0,
        tokens_used: parseNumber(node.tokens_used),
        cost_usd: parseNumber(node.cost_usd),
        metadata: toRecord(node.metadata) ?? {},
      });
    }
    return nodes;
  } catch {
    return [];
  }
}

function nodeSignature(node: GraphNode): string {
  return `${node.type}:${safeJsonString(node.input)}`;
}

function computeGraphDiff(
  currentNodes: GraphNode[],
  parentNodes: GraphNode[],
  severityDelta: number,
): GraphDiff {
  const currentMap = new Map<string, GraphNode>();
  const parentMap = new Map<string, GraphNode>();

  for (const node of currentNodes) {
    const key = nodeSignature(node);
    if (!currentMap.has(key)) currentMap.set(key, node);
  }
  for (const node of parentNodes) {
    const key = nodeSignature(node);
    if (!parentMap.has(key)) parentMap.set(key, node);
  }

  const addedNodes: GraphNode[] = [];
  const removedNodes: GraphNode[] = [];
  const changedNodes: Array<{ before: GraphNode; after: GraphNode }> = [];

  for (const [key, current] of currentMap.entries()) {
    const before = parentMap.get(key);
    if (!before) {
      addedNodes.push(current);
      continue;
    }
    if (safeJsonString(before.output) !== safeJsonString(current.output)) {
      changedNodes.push({ before, after: current });
    }
  }

  for (const [key, parent] of parentMap.entries()) {
    if (!currentMap.has(key)) {
      removedNodes.push(parent);
    }
  }

  return {
    added_nodes: addedNodes,
    removed_nodes: removedNodes,
    changed_nodes: changedNodes,
    severity_delta: Number(severityDelta.toFixed(4)),
  };
}

function overallSeverity(runResults: ChaosRunResult[]): number {
  if (runResults.length === 0) return 0;
  const total = runResults.reduce((acc, run) => acc + run.severity, 0);
  return Number((total / runResults.length).toFixed(4));
}

function formatSeverityDelta(delta: number): string {
  const rounded = Number(delta.toFixed(4));
  return rounded >= 0 ? `+${rounded}` : `${rounded}`;
}

function defaultForkBranchName(simulationId: string): string {
  const suffix = simulationId.replace(/^sim_/, "").toLowerCase().slice(0, 8);
  return `fix/${suffix || "fork"}`;
}

async function fetchBranch(
  env: Env,
  agentId: string,
  branchName: string,
): Promise<BranchRow | null> {
  return (
    (await env.DB.prepare(
      `SELECT id, agent_id, name, head_version_id, created_at
       FROM branches
       WHERE agent_id = ? AND name = ?
       LIMIT 1`,
    )
      .bind(agentId, branchName)
      .first<BranchRow>()) ?? null
  );
}

async function ensureBranch(
  env: Env,
  simulation: SimulationRow,
  branchName: string,
  isFork: boolean,
): Promise<BranchRow> {
  const existing = await fetchBranch(env, simulation.agent_id, branchName);
  if (existing) return existing;

  let initialHeadVersionId: string | null = null;
  if (isFork) {
    const mainBranch = await fetchBranch(env, simulation.agent_id, "main");
    initialHeadVersionId = mainBranch?.head_version_id ?? null;
  }

  const branch: BranchRow = {
    id: `brh_${nanoid(21)}`,
    agent_id: simulation.agent_id,
    name: branchName,
    head_version_id: initialHeadVersionId,
    created_at: nowUnix(),
  };

  await env.DB.prepare(
    `INSERT INTO branches (id, agent_id, name, head_version_id, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(branch.id, branch.agent_id, branch.name, branch.head_version_id, branch.created_at)
    .run();

  return branch;
}

async function fetchVersion(env: Env, versionId: string): Promise<VersionRow | null> {
  return (
    (await env.DB.prepare(
      `SELECT id, simulation_id, parent_version_id, branch_name, commit_message, diff_summary, overall_severity, created_at
       FROM run_versions
       WHERE id = ?
       LIMIT 1`,
    )
      .bind(versionId)
      .first<VersionRow>()) ?? null
  );
}

async function primaryRunForSimulation(
  env: Env,
  simulationId: string,
): Promise<{ id: string; trace_r2_key: string | null } | null> {
  return (
    (await env.DB.prepare(
      `SELECT id, trace_r2_key
       FROM sim_runs
       WHERE simulation_id = ?
       ORDER BY COALESCE(severity, -1) DESC, created_at ASC
       LIMIT 1`,
    )
      .bind(simulationId)
      .first<{ id: string; trace_r2_key: string | null }>()) ?? null
  );
}

async function selectCurrentPrimaryRun(
  env: Env,
  simulationId: string,
  runResults: ChaosRunResult[],
): Promise<{ id: string; trace_r2_key: string | null } | null> {
  if (runResults.length > 0) {
    let top = runResults[0];
    for (const run of runResults) {
      if (run.severity > top.severity) top = run;
    }
    return {
      id: top.run_id,
      trace_r2_key: top.trace_r2_key,
    };
  }
  return primaryRunForSimulation(env, simulationId);
}

function parseBranchNameFromConfig(configJson: string): string | null {
  try {
    const parsed = JSON.parse(configJson) as Record<string, unknown>;
    const branch = parsed.branch_name;
    if (typeof branch === "string" && branch.trim()) {
      return branch.trim();
    }
  } catch {
    return null;
  }
  return null;
}

async function autoVersionSimulation(
  env: Env,
  simulation: SimulationRow,
  runResults: ChaosRunResult[],
  options: { isFork: boolean },
): Promise<void> {
  const branchName = options.isFork
    ? parseBranchNameFromConfig(simulation.config_json) ?? defaultForkBranchName(simulation.id)
    : "main";

  const branch = await ensureBranch(env, simulation, branchName, options.isFork);
  const parentVersionId = branch.head_version_id;
  const parentVersion = parentVersionId ? await fetchVersion(env, parentVersionId) : null;

  const currentPrimaryRun = await selectCurrentPrimaryRun(env, simulation.id, runResults);
  const currentNodes = currentPrimaryRun
    ? await readRunGraph(env, simulation.id, currentPrimaryRun.id, currentPrimaryRun.trace_r2_key)
    : [];

  let parentNodes: GraphNode[] = [];
  let parentSeverity = 0;
  if (parentVersion) {
    parentSeverity = parentVersion.overall_severity ?? 0;
    const parentPrimaryRun = await primaryRunForSimulation(env, parentVersion.simulation_id);
    if (parentPrimaryRun) {
      parentNodes = await readRunGraph(
        env,
        parentVersion.simulation_id,
        parentPrimaryRun.id,
        parentPrimaryRun.trace_r2_key,
      );
    }
  }

  const currentSeverity = overallSeverity(runResults);
  const severityDelta = currentSeverity - parentSeverity;
  const diff = computeGraphDiff(currentNodes, parentNodes, severityDelta);

  const versionId = `ver_${nanoid(21)}`;
  const diffKey = `traces/${simulation.agent_id}/versions/${versionId}/diff.json.gz`;
  const diffPayload = {
    added_nodes: diff.added_nodes,
    removed_nodes: diff.removed_nodes,
    changed_nodes: diff.changed_nodes,
    severity_delta: diff.severity_delta,
  };
  const compressedDiff = await gzipJson(diffPayload);
  await env.TRACES.put(diffKey, compressedDiff, {
    httpMetadata: {
      contentType: "application/json",
      contentEncoding: "gzip",
    },
  });

  const categoryCount = runResults.length;
  const commitMessage = `Run ${categoryCount} categories, severity ${currentSeverity} (${formatSeverityDelta(diff.severity_delta)})`;
  const diffSummary = {
    added_count: diff.added_nodes.length,
    removed_count: diff.removed_nodes.length,
    changed_count: diff.changed_nodes.length,
    severity_delta: diff.severity_delta,
    diff_r2_key: diffKey,
    branch_name: branchName,
    compared_run_id: currentPrimaryRun?.id ?? null,
  };

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO run_versions
       (id, simulation_id, parent_version_id, branch_name, commit_message, diff_summary, overall_severity, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      versionId,
      simulation.id,
      parentVersionId,
      branchName,
      commitMessage,
      JSON.stringify(diffSummary),
      currentSeverity,
      nowUnix(),
    ),
    env.DB.prepare("UPDATE branches SET head_version_id = ? WHERE id = ?").bind(versionId, branch.id),
  ]);
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
  await autoVersionSimulation(env, simulation, results, { isFork: false });
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
  await autoVersionSimulation(env, simulation, [result], { isFork: true });
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
