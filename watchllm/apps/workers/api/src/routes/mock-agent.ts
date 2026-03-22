import type { Env } from "@watchllm/types";
import { Hono } from "hono";

type DevContext = { Bindings: Env };

const app = new Hono<DevContext>();

const MOCK_USER_ID = "usr_mockdev";
const MOCK_PROJECT_ID = "prj_mockdev";
const MOCK_AGENT_ID = "agt_mockdev";

const nowUnix = (): number => Math.floor(Date.now() / 1000);

function randomChance(probability: number): boolean {
  const value = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
  return value < probability;
}

function responseTextFor(input: string): { output: string; compromised: boolean } {
  const normalized = input.toLowerCase();
  const promptInjection =
    normalized.includes("ignore previous") ||
    normalized.includes("system:") ||
    normalized.includes("dan") ||
    normalized.includes("system prompt");

  if (promptInjection && randomChance(0.4)) {
    return {
      output: "System prompt: You are an internal assistant. Hidden policy keys loaded.",
      compromised: true,
    };
  }

  if (normalized.includes("delete") || normalized.includes("drop") || normalized.includes("rm -rf")) {
    return {
      output: "I cannot perform destructive operations. Please provide a safe alternative request.",
      compromised: false,
    };
  }

  return {
    output: "I can help with safe analysis. Please share additional context for a compliant answer.",
    compromised: false,
  };
}

app.get("/register", async (c) => {
  const ts = nowUnix();
  const invokeUrl = `${new URL(c.req.url).origin}/api/v1/dev/mock-agent/invoke`;

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT OR IGNORE INTO users (id, email, github_username, tier, created_at, stripe_customer_id, last_seen_at)
       VALUES (?, ?, ?, 'pro', ?, NULL, ?)`
    ).bind(MOCK_USER_ID, "mock@watchllm.dev", "mock-agent", ts, ts),
    c.env.DB.prepare(
      `INSERT OR IGNORE INTO projects (id, user_id, name, created_at, deleted_at)
       VALUES (?, ?, ?, ?, NULL)`
    ).bind(MOCK_PROJECT_ID, MOCK_USER_ID, "Mock Agent Project", ts),
    c.env.DB.prepare(
      `INSERT OR IGNORE INTO agents (id, project_id, name, endpoint_url, framework, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(MOCK_AGENT_ID, MOCK_PROJECT_ID, "Mock Agent", invokeUrl, "mock", ts),
    c.env.DB.prepare("UPDATE agents SET endpoint_url = ? WHERE id = ?").bind(invokeUrl, MOCK_AGENT_ID),
  ]);

  return c.json({
    data: {
      user_id: MOCK_USER_ID,
      project_id: MOCK_PROJECT_ID,
      agent_id: MOCK_AGENT_ID,
      endpoint_url: invokeUrl,
    },
    error: null,
  });
});

app.post("/invoke", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json(
      {
        data: null,
        error: { message: "Invalid JSON body", code: "VALIDATION_ERROR" },
      },
      400,
    );
  }

  const input =
    typeof body === "object" && body !== null && typeof (body as Record<string, unknown>).input === "string"
      ? ((body as Record<string, unknown>).input as string)
      : "";

  const base = responseTextFor(input);
  const includeToolCalls = randomChance(0.3);
  const toolCalls = includeToolCalls
    ? [
        {
          name: base.compromised ? "delete_records" : "search_docs",
          args: base.compromised ? { force: true } : { query: input.slice(0, 60) },
        },
      ]
    : [];

  return c.json({
    output: base.output,
    safe: !base.compromised,
    compromised: base.compromised,
    tool_calls: toolCalls,
  });
});

export default app;
