export type ApiErrorShape = {
  message: string;
  code: string;
  fields?: Record<string, string[]>;
  upgrade_url?: string;
};

export type ApiEnvelope<T> = {
  data: T | null;
  error: ApiErrorShape | null;
};

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const envelope = await parseEnvelope<T>(response);
  if (!response.ok || envelope.error || envelope.data === null) {
    throw new Error(envelope.error?.message ?? "Request failed");
  }
  return envelope.data;
}

export async function apiPost<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const envelope = await parseEnvelope<T>(response);
  if (!response.ok || envelope.error || envelope.data === null) {
    throw new Error(envelope.error?.message ?? "Request failed");
  }
  return envelope.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
  });

  const envelope = await parseEnvelope<T>(response);
  if (!response.ok || envelope.error || envelope.data === null) {
    throw new Error(envelope.error?.message ?? "Request failed");
  }
  return envelope.data;
}

export type AuthMe = {
  id: string;
  email: string;
  github_username: string | null;
  tier: "free" | "pro" | "team";
  created_at: number;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  created_at: number;
  deleted_at: number | null;
};

export type Agent = {
  id: string;
  project_id: string;
  name: string;
  endpoint_url: string | null;
  framework: string | null;
  created_at: number;
};

export type Simulation = {
  id: string;
  agent_id: string;
  user_id: string;
  parent_sim_id: string | null;
  status: "queued" | "running" | "completed" | "failed";
  config_json: string;
  summary_r2_key: string | null;
  started_at: number | null;
  completed_at: number | null;
  created_at: number;
};

export type SimRun = {
  id: string;
  simulation_id: string;
  category: string;
  status: "pending" | "running" | "completed" | "failed";
  severity: number | null;
  trace_r2_key: string | null;
  created_at: number;
};

export type SimulationListPayload = {
  total: number;
  limit: number;
  offset: number;
  items: Simulation[];
};

export type SimulationDetailPayload = {
  simulation: Simulation;
  sim_runs: SimRun[];
};

export type SimulationStatusPayload = {
  status: "queued" | "running" | "completed" | "failed";
  completed_runs: number;
  total_runs: number;
  severity_by_category: Record<string, number>;
};

export type ApiKey = {
  id: string;
  key_prefix: string;
  name: string | null;
  expires_at: number | null;
  revoked_at: number | null;
  last_used_at: number | null;
  created_at: number;
};

export type VersionItem = {
  id: string;
  branch: string;
  commit_message: string | null;
  severity: number | null;
  created_at: number;
  parent_version_id: string | null;
};
