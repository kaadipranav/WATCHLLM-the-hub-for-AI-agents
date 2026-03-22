/// <reference types="@cloudflare/workers-types" />

/** Application users table (WatchLLM), not Better Auth `user` */
export type UserRow = {
  id: string;
  email: string;
  github_username: string | null;
  tier: string;
  created_at: number;
  stripe_customer_id: string | null;
  last_seen_at: number | null;
};

export type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  created_at: number;
  deleted_at?: number | null;
};

export type AgentRow = {
  id: string;
  project_id: string;
  name: string;
  endpoint_url: string | null;
  framework: string | null;
  created_at: number;
};

export type SimulationRow = {
  id: string;
  agent_id: string;
  user_id: string;
  parent_sim_id?: string | null;
  status: string;
  config_json: string;
  summary_r2_key: string | null;
  started_at: number | null;
  completed_at: number | null;
  created_at: number;
};

export type SimRunRow = {
  id: string;
  simulation_id: string;
  category: string;
  status: string;
  severity: number | null;
  trace_r2_key: string | null;
  created_at: number;
};

export type ApiKeyRow = {
  id: string;
  user_id: string;
  key_prefix: string;
  key_hash: string;
  name: string | null;
  expires_at: number | null;
  revoked_at: number | null;
  last_used_at: number | null;
  created_at: number;
};

export type SimulationStatus = "queued" | "running" | "completed" | "failed";
export type RunStatus = "pending" | "running" | "completed" | "failed";
export type AttackCategory =
  | "prompt_injection"
  | "tool_abuse"
  | "hallucination"
  | "context_poisoning"
  | "infinite_loop"
  | "jailbreak"
  | "data_exfiltration"
  | "role_confusion";
export type UserTier = "free" | "pro" | "team";

export type NodeType =
  | "llm_call"
  | "tool_call"
  | "decision"
  | "memory_read"
  | "memory_write"
  | "agent_start"
  | "agent_end";

export type GraphNode = {
  id: string;
  parent_id: string | null;
  type: NodeType;
  input: unknown;
  output: unknown;
  timestamp: number;
  latency_ms: number;
  tokens_used: number | null;
  cost_usd: number | null;
  metadata: Record<string, unknown>;
};

export type GraphEdge = {
  from: string;
  to: string;
};

export type RunTrace = {
  run_id: string;
  simulation_id: string;
  agent_id: string;
  category: AttackCategory;
  adversarial_input: string;
  started_at: number;
  ended_at: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  severity: number;
  compromised: boolean;
  judge_verdict: string;
  suggested_fix: string;
};

export type SimulationReport = {
  simulation_id: string;
  agent_id: string;
  user_id: string;
  status: SimulationStatus;
  overall_severity: number | null;
  categories: Partial<Record<AttackCategory, { severity: number; run_id: string }>>;
  created_at: number;
  completed_at: number | null;
};

export type ApiError = {
  message: string;
  code: string;
  upgrade_url?: string;
  fields?: Record<string, string[]>;
};

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError };

export type Env = {
  DB: D1Database;
  TRACES: R2Bucket;
  KV: KVNamespace;
  SIMULATION_QUEUE?: Queue<unknown>;
  CHAOS_WORKER?: Fetcher;
  CHAOS_WORKER_URL?: string;
  AI?: Ai;
  BETTER_AUTH_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRO_PRICE_ID: string;
  STRIPE_TEAM_PRICE_ID: string;
  OPENROUTER_API_KEY: string;
  SENTRY_DSN: string;
  APP_URL: string;
};
