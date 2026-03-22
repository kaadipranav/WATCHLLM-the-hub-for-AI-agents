# WatchLLM — Architecture

## Stack (Zero Cost Until Revenue)

| Layer          | Service                  | Reason                                          |
|----------------|--------------------------|-------------------------------------------------|
| Frontend       | Next.js + CF Pages       | Free hosting, no cold starts, global CDN        |
| API Layer      | Hono.js on CF Workers    | Edge-native, TypeScript, free 100k req/day      |
| Execution      | CF Workers (separate)    | Chaos runs, judge loop, trace writes            |
| Database       | Cloudflare D1            | SQLite at edge, 5GB free, no sleep issues       |
| Trace Storage  | Cloudflare R2            | 10GB free, gzip JSON, perfect for traces        |
| Cache/State    | Cloudflare KV            | Rate limiting, API key cache, session state     |
| Auth           | Better Auth              | Open source, GitHub OAuth, runs on Workers      |
| LLM Judge      | Cloudflare AI            | Free tier, llama models, no per-call cost       |
| Secrets        | Doppler                  | Free Team plan (GitHub Student Pack)            |
| Error Tracking | Sentry                   | Free student tier (GitHub Student Pack)         |
| Payments       | Stripe                   | First $1k fees waived (GitHub Student Pack)     |

No DigitalOcean. No Supabase. No Clerk. No Vercel. $0 until paying users.

## Services NOT Used and Why
- Supabase: free tier pauses after 1 week inactivity. Unacceptable.
- Clerk: paid after free tier threshold. Auth should be free forever.
- Vercel: free tier has limits and function timeouts. CF Pages is better.
- OpenRouter: per-call cost for judge. CF AI covers this on free tier.
- FastAPI: Python doesn't run on Workers natively. Hono replaces it cleanly.

## Data Flow
```
Engineer installs SDK → decorates agent with @watchllm.test()
SDK calls POST /api/agents/register → Worker creates agent row in D1
Engineer runs watchllm simulate → POST /api/simulations
API Worker creates simulation row, enqueues to CF Queue
Orchestrator Worker picks up job, splits by attack category
Chaos Worker runs attack loop:
  1. Generate adversarial input (CF AI or template)
  2. Call engineer's agent endpoint
  3. Rule-based filter on response
  4. LLM judge evaluates (CF AI)
  5. Write trace node to R2 (gzip JSON)
  6. Write run metadata to D1
Orchestrator aggregates results, writes summary to R2
Dashboard polls simulation status → fetches report from R2
Dashboard streams graph replay from R2 trace
```

## Database Schema (D1 / SQLite)
```sql
-- users
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- Better Auth user ID
  email TEXT UNIQUE NOT NULL,
  github_username TEXT,
  tier TEXT DEFAULT 'free',      -- free | pro | team
  created_at INTEGER NOT NULL,
  stripe_customer_id TEXT
);

-- projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- agents
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL,
  endpoint_url TEXT,             -- where the agent accepts requests
  framework TEXT,                -- langchain | crewai | openai | custom
  created_at INTEGER NOT NULL
);

-- simulations
CREATE TABLE simulations (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'queued',  -- queued | running | completed | failed
  config_json TEXT NOT NULL,     -- attack categories, thresholds, etc
  summary_r2_key TEXT,           -- R2 key for the summary report
  started_at INTEGER,
  completed_at INTEGER,
  created_at INTEGER NOT NULL
);

-- sim_runs (one per attack category per simulation)
CREATE TABLE sim_runs (
  id TEXT PRIMARY KEY,
  simulation_id TEXT NOT NULL REFERENCES simulations(id),
  category TEXT NOT NULL,        -- prompt_injection | tool_abuse | etc
  status TEXT DEFAULT 'pending',
  severity REAL,                 -- 0.0 to 1.0
  trace_r2_key TEXT,             -- R2 key for the full trace graph
  created_at INTEGER NOT NULL
);

-- api_keys
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  key_prefix TEXT NOT NULL,      -- shown in UI e.g. wllm_abc123...
  key_hash TEXT NOT NULL,        -- bcrypt hash of full key
  name TEXT,
  expires_at INTEGER,
  revoked_at INTEGER,
  last_used_at INTEGER,
  created_at INTEGER NOT NULL
);

-- run_versions (git for agents)
CREATE TABLE run_versions (
  id TEXT PRIMARY KEY,              -- ver_xxxx
  simulation_id TEXT NOT NULL REFERENCES simulations(id),
  parent_version_id TEXT,           -- null = root commit
  branch_name TEXT DEFAULT 'main',
  commit_message TEXT,              -- auto-generated summary of what changed
  diff_summary TEXT,                -- JSON: what changed vs parent version
  overall_severity REAL,
  created_at INTEGER NOT NULL
);

-- branches
CREATE TABLE branches (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id),
  name TEXT NOT NULL,               -- 'main', 'fix/prompt-injection', etc
  head_version_id TEXT,             -- latest version on this branch
  created_at INTEGER NOT NULL
);
```

## R2 Object Structure
```
traces/
  {simulation_id}/
    summary.json.gz          -- overall simulation report
    runs/
      {run_id}/
        graph.json.gz        -- full execution graph (nodes + edges)
        
Graph JSON schema:
{
  "run_id": "string",
  "agent_id": "string", 
  "simulation_id": "string",
  "category": "string",
  "started_at": "iso8601",
  "nodes": [
    {
      "id": "string",
      "parent_id": "string | null",
      "type": "llm_call | tool_call | decision | memory_read | memory_write",
      "input": "any",
      "output": "any",
      "timestamp": "iso8601",
      "latency_ms": "number",
      "tokens_used": "number | null",
      "cost_usd": "number | null",
      "metadata": "object"
    }
  ],
  "edges": [
    { "from": "node_id", "to": "node_id" }
  ],
  "severity": "number",
  "judge_verdict": "string",
  "suggested_fix": "string"
}

traces/
  {agent_id}/
    versions/
      {version_id}/
        diff.json.gz    -- node-level diff vs parent version
```

## Auth Model
- Dashboard: GitHub OAuth via Better Auth → session cookie
- SDK/CLI: API key via X-WatchLLM-Api-Key header
- API key is hashed in D1, prefix shown in UI, full key shown once on creation
- Rate limiting via KV: key = "rl:{user_id}:{hour}", value = count

## Worker Boundaries
- api-worker: handles all HTTP routes, auth, D1 reads/writes
- orchestrator-worker: triggered by CF Queue, fans out to chaos runs
- chaos-worker: single attack run, writes to R2 and D1

## Environment Variables (managed via Doppler)
BETTER_AUTH_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SENTRY_DSN
CF_ACCOUNT_ID
