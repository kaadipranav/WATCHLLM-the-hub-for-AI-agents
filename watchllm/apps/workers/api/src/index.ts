import type { Env } from "@watchllm/types";
import type { ApiError, ApiResponse, AttackCategory, UserTier } from "@watchllm/types";
import * as Sentry from "@sentry/cloudflare";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { handleAuthRequest } from "./auth";
import mockAgentRoutes from "./routes/mock-agent";
import {
  requireAuth,
  requireSession,
  type AuthMethod,
  type AuthedUser,
} from "./middleware/auth";
import { rateLimitApiHourly } from "./middleware/rate-limit";
import { enforceSimulationLaunchLimit } from "./middleware/rate-limit";

type AppContext = { Bindings: Env; Variables: { user?: AuthedUser; authMethod?: AuthMethod } };

const app = new Hono<AppContext>();

const UPGRADE_URL = "https://watchllm.dev/dashboard/settings#billing";
const ATTACK_CATEGORIES = [
  "prompt_injection",
  "tool_abuse",
  "hallucination",
  "context_poisoning",
  "infinite_loop",
  "jailbreak",
  "data_exfiltration",
  "role_confusion",
] as const;
const FREE_TIER_CATEGORIES: ReadonlySet<AttackCategory> = new Set([
  "prompt_injection",
  "tool_abuse",
  "hallucination",
]);

const tierSchema = z.enum(["pro", "team"]);
const keyCreateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  expires_in_days: z.number().int().min(1).max(3650).optional(),
});
const projectCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
});
const agentRegisterSchema = z.object({
  name: z.string().trim().min(1).max(120),
  project_id: z.string().min(1),
  endpoint_url: z.string().url().optional(),
  framework: z.string().trim().max(60).optional(),
});
const simulationCreateSchema = z.object({
  agent_id: z.string().min(1),
  categories: z.array(z.enum(ATTACK_CATEGORIES)).min(1).max(8),
  threshold: z.string().trim().min(1).max(50).optional(),
  config: z.record(z.unknown()).optional(),
});
const forkSchema = z.object({
  fork_from_node: z.string().min(1),
  new_input: z.unknown(),
});
const branchCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  from_version_id: z.string().min(1).optional(),
});

type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "TIER_LIMIT"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 429 | 500;

const nowUnix = (): number => Math.floor(Date.now() / 1000);

function success<T>(c: Context<AppContext>, data: T, status: 200 | 201 = 200): Response {
  const body: ApiResponse<T> = { data, error: null };
  return c.json(body, status);
}

function failure(
  c: Context<AppContext>,
  status: HttpStatus,
  message: string,
  code: ErrorCode,
  extras?: Omit<ApiError, "message" | "code">,
): Response {
  const body: ApiResponse<null> = {
    data: null,
    error: {
      message,
      code,
      ...(extras ?? {}),
    },
  };
  return c.json(body, status);
}

function tierLimit(c: Context<AppContext>): Response {
  return failure(
    c,
    429,
    "You've reached the Free tier limit. Upgrade to Pro.",
    "TIER_LIMIT",
    { upgrade_url: UPGRADE_URL },
  );
}

function validationFailure(c: Context<AppContext>, issue: z.ZodError): Response {
  const fields = issue.flatten().fieldErrors;
  const normalized: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(fields)) {
    normalized[key] = Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
  }
  return failure(c, 400, "Invalid request body", "VALIDATION_ERROR", { fields: normalized });
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function parseUserTier(value: unknown): UserTier {
  if (value === "pro" || value === "team") return value;
  return "free";
}

async function parseBody(c: Context<AppContext>): Promise<unknown | null> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}

async function readGzipJson(object: R2ObjectBody): Promise<unknown | null> {
  try {
    const stream = object.body.pipeThrough(new DecompressionStream("gzip"));
    const text = await new Response(stream).text();
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function withGuard(
  c: Context<AppContext>,
  run: () => Promise<Response>,
): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    console.error(error);
    if (c.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
    return failure(c, 500, "Internal server error", "INTERNAL_ERROR");
  }
}

async function getAppUser(c: Context<AppContext>): Promise<{
  id: string;
  email: string;
  github_username: string | null;
  tier: string;
  created_at: number;
  stripe_customer_id: string | null;
} | null> {
  const user = c.get("user");
  if (!user) return null;
  return (
    (await c.env.DB.prepare(
      `SELECT id, email, github_username, tier, created_at, stripe_customer_id
       FROM users
       WHERE id = ?
       LIMIT 1`,
    )
      .bind(user.id)
      .first<{
        id: string;
        email: string;
        github_username: string | null;
        tier: string;
        created_at: number;
        stripe_customer_id: string | null;
      }>()) ?? null
  );
}

async function getAgentOwnedByUser(env: Env, userId: string, agentId: string): Promise<{
  id: string;
  project_id: string;
  name: string;
  endpoint_url: string | null;
  framework: string | null;
  created_at: number;
} | null> {
  return (
    (await env.DB.prepare(
      `SELECT a.id, a.project_id, a.name, a.endpoint_url, a.framework, a.created_at
       FROM agents AS a
       INNER JOIN projects AS p ON p.id = a.project_id
       WHERE a.id = ?
         AND p.user_id = ?
         AND p.deleted_at IS NULL
       LIMIT 1`,
    )
      .bind(agentId, userId)
      .first<{
        id: string;
        project_id: string;
        name: string;
        endpoint_url: string | null;
        framework: string | null;
        created_at: number;
      }>()) ?? null
  );
}

async function getSimulationOwnedByUser(env: Env, userId: string, simulationId: string): Promise<{
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
} | null> {
  return (
    (await env.DB.prepare(
      `SELECT id, agent_id, user_id, parent_sim_id, status, config_json, summary_r2_key, started_at, completed_at, created_at
       FROM simulations
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
    )
      .bind(simulationId, userId)
      .first<{
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
      }>()) ?? null
  );
}

async function getStripeCustomerId(
  env: Env,
  userId: string,
  email: string,
  existingCustomerId: string | null,
): Promise<string | null> {
  if (existingCustomerId) return existingCustomerId;
  const params = new URLSearchParams();
  params.set("email", email);
  params.set("metadata[user_id]", userId);
  const response = await fetch("https://api.stripe.com/v1/customers", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const payload = (await response.json()) as unknown;
  const record = toRecord(payload);
  const id = toString(record?.id);
  if (!response.ok || !id) {
    return null;
  }
  await env.DB.prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?").bind(id, userId).run();
  return id;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
}

async function verifyStripeSignature(
  payload: string,
  signatureHeader: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader) return false;
  const pairs = signatureHeader.split(",").map((part) => part.trim());
  const signatures: string[] = [];
  let timestamp: string | null = null;

  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx <= 0) continue;
    const key = pair.slice(0, idx);
    const value = pair.slice(idx + 1);
    if (key === "t") timestamp = value;
    if (key === "v1") signatures.push(value);
  }

  if (!timestamp || signatures.length === 0) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const now = nowUnix();
  if (Math.abs(now - ts) > 300) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${payload}`),
  );
  const computed = bufferToHex(signatureBytes);
  return signatures.some((candidate) => constantTimeEqual(candidate, computed));
}

function tierFromPriceId(env: Env, priceId: string | null): UserTier {
  if (!priceId) return "free";
  if (priceId === env.STRIPE_TEAM_PRICE_ID) return "team";
  if (priceId === env.STRIPE_PRO_PRICE_ID) return "pro";
  return "free";
}

function readSubscriptionTier(env: Env, data: Record<string, unknown> | null): UserTier {
  const itemsObj = toRecord(data?.items);
  const items = Array.isArray(itemsObj?.data) ? itemsObj.data : [];
  for (const item of items) {
    const itemRecord = toRecord(item);
    const priceRecord = toRecord(itemRecord?.price);
    const priceId = toString(priceRecord?.id);
    const tier = tierFromPriceId(env, priceId);
    if (tier === "team") return "team";
    if (tier === "pro") return "pro";
  }
  return "free";
}

async function processStripeEvent(env: Env, event: Record<string, unknown>): Promise<void> {
  const eventType = toString(event.type);
  const dataOuter = toRecord(event.data);
  const dataObject = toRecord(dataOuter?.object);
  if (!eventType || !dataObject) return;

  if (eventType === "checkout.session.completed") {
    const metadata = toRecord(dataObject.metadata);
    const userId = toString(metadata?.user_id);
    const requestedTier = parseUserTier(toString(metadata?.tier));
    const customerId = toString(dataObject.customer);
    if (!userId) return;
    await env.DB.prepare(
      `UPDATE users
       SET tier = ?, stripe_customer_id = COALESCE(?, stripe_customer_id)
       WHERE id = ?`,
    )
      .bind(requestedTier, customerId, userId)
      .run();
    return;
  }

  if (eventType === "customer.subscription.updated") {
    const customerId = toString(dataObject.customer);
    if (!customerId) return;
    const tier = readSubscriptionTier(env, dataObject);
    await env.DB.prepare("UPDATE users SET tier = ? WHERE stripe_customer_id = ?")
      .bind(tier, customerId)
      .run();
    return;
  }

  if (eventType === "customer.subscription.deleted") {
    const customerId = toString(dataObject.customer);
    if (!customerId) return;
    await env.DB.prepare("UPDATE users SET tier = 'free' WHERE stripe_customer_id = ?")
      .bind(customerId)
      .run();
  }
}

function corsOrigin(env: Env, requestOrigin: string | undefined): string {
  try {
    if (new URL(env.APP_URL).hostname === "localhost") {
      return requestOrigin ?? env.APP_URL;
    }
  } catch {
    /* ignore */
  }
  return env.APP_URL;
}

app.use(
  "*",
  cors({
    origin: (origin, c) => corsOrigin(c.env, origin),
    allowHeaders: ["Content-Type", "Authorization", "X-WatchLLM-Api-Key"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.get("/api/v1/health", (c) =>
  success(c, {
    status: "ok",
    timestamp: nowUnix(),
  }),
);

app.route("/api/v1/dev/mock-agent", mockAgentRoutes);

app.get("/api/v1/auth/signin/github", async (c) => {
  const url = new URL(c.req.url);
  // Force frontend origin for redirect matching
  const origin = url.origin.replace("api.watchllm.dev", "watchllm.dev");
  
  const internal = new Request(`${origin}/api/v1/auth/sign-in/social`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: c.req.header("cookie") ?? "",
      origin: origin,
    },
    body: JSON.stringify({
      provider: "github",
      // Important: GitHub OAuth needs the exact URL configured in the GitHub app settings.
      // Usually this means it needs to hit the API directly if the API is managing the callback
      callbackURL: `${c.env.APP_URL}/api/v1/auth/callback/github`,
    }),
  });
  const response = await handleAuthRequest(internal, c.env);
  
  // Copy Set-Cookie headers to the response
  const setCookies = response.headers.getSetCookie?.() || [];
  for (const cookie of setCookies) {
    c.header("Set-Cookie", cookie);
  }
  
  const body = await response.json();
  return c.json(body, response.status as 200 | 201);
});

app.get("/api/v1/auth/me", requireAuth, async (c) =>
  withGuard(c, async () => {
    const user = await getAppUser(c);
    if (!user) {
      return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    }
    return success(c, {
      id: user.id,
      email: user.email,
      github_username: user.github_username,
      tier: parseUserTier(user.tier),
      created_at: user.created_at,
    });
  }),
);

// Handle OAuth callbacks from social providers
app.get("/api/v1/auth/callback/:provider", async (c) => {
  const url = new URL(c.req.url);
  // Tell Better Auth the request came from where it expects (the APP_URL)
  if (url.hostname === "api.watchllm.dev") {
    url.hostname = "watchllm.dev";
  } else {
    const appUrlObj = new URL(c.env.APP_URL);
    url.protocol = appUrlObj.protocol;
    url.host = appUrlObj.host;
  }
  
  // We want to ultimately redirect the user to the frontend dashboard.
  const frontendOrigin = c.env.APP_URL;
  
  const internal = new Request(url.toString(), {
    method: c.req.method,
    headers: c.req.raw.headers,
  });
  
  const response = await handleAuthRequest(internal, c.env);
  
  // If the response is a redirect (from Better Auth), extract the redirect URL
  if (response.status === 302 || response.status === 301) {
    // If it's trying to redirect to a relative path or the auth route, hijack it
    // because Better Auth's default is sometimes to redirect to the callback URL again
    const redirectUrl = new URL(response.headers.get("Location") || "", frontendOrigin);
    if (!redirectUrl.searchParams.has("error")) {
      const dashboardUrl = `${frontendOrigin}/dashboard`;
      
      // Preserve Set-Cookie headers for the session
      const newResponse = Response.redirect(dashboardUrl, 302);
      const setCookies = response.headers.getSetCookie?.() || [];
      for (const cookie of setCookies) {
        newResponse.headers.append("Set-Cookie", cookie);
      }
      return newResponse;
    }
    
    return response;
  }
  
  // If it's a successful response (though OAuth usually uses 302), redirect to dashboard
  if (response.status === 200) {
    const dashboardUrl = `${frontendOrigin}/dashboard`;
    const newResponse = Response.redirect(dashboardUrl, 302);
    const setCookies = response.headers.getSetCookie?.() || [];
    for (const cookie of setCookies) {
      newResponse.headers.append("Set-Cookie", cookie);
    }
    return newResponse;
  }
  
  return response;
});

app.on(["GET", "POST", "PUT", "PATCH", "DELETE"], "/api/v1/auth/*", (c) => {
  const url = new URL(c.req.url);
  
  // If the request came directly to api.watchllm.dev, trick Better Auth into 
  // thinking it came from the frontend watchllm.dev domain for cookie alignment
  if (url.hostname === "api.watchllm.dev") {
    url.hostname = "watchllm.dev";
  } else {
    // Localhost or other domains
    const appUrlObj = new URL(c.env.APP_URL);
    url.protocol = appUrlObj.protocol;
    url.host = appUrlObj.host;
  }
  
  const internal = new Request(url.toString(), {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.raw.body,
  });
  
  return handleAuthRequest(internal, c.env);
});

const keys = new Hono<AppContext>();
keys.use("*", requireAuth);
keys.use("*", rateLimitApiHourly);
keys.get("/", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const result = await c.env.DB.prepare(
      `SELECT id, key_prefix, name, expires_at, revoked_at, last_used_at, created_at
       FROM api_keys
       WHERE user_id = ?
       ORDER BY created_at DESC`,
    )
      .bind(user.id)
      .all<{
        id: string;
        key_prefix: string;
        name: string | null;
        expires_at: number | null;
        revoked_at: number | null;
        last_used_at: number | null;
        created_at: number;
      }>();
    return success(c, result.results ?? []);
  }),
);

keys.post("/", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const body = await parseBody(c);
    const parsed = keyCreateSchema.safeParse(body);
    if (!parsed.success) return validationFailure(c, parsed.error);

    const fullKey = `wllm_${nanoid(32)}`;
    const keyPrefix = fullKey.slice(0, 12);
    const keyHash = await bcrypt.hash(fullKey, 10);
    const createdAt = nowUnix();
    const expiresAt = parsed.data.expires_in_days
      ? createdAt + parsed.data.expires_in_days * 24 * 60 * 60
      : null;
    const id = `key_${nanoid(21)}`;

    await c.env.DB.prepare(
      `INSERT INTO api_keys (id, user_id, key_prefix, key_hash, name, expires_at, revoked_at, last_used_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?)`,
    )
      .bind(id, user.id, keyPrefix, keyHash, parsed.data.name ?? null, expiresAt, createdAt)
      .run();

    return success(
      c,
      {
        id,
        key_prefix: keyPrefix,
        full_key: fullKey,
        name: parsed.data.name ?? null,
        created_at: createdAt,
      },
      201,
    );
  }),
);

keys.delete("/:id", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const keyId = c.req.param("id");
    const result = await c.env.DB.prepare(
      `UPDATE api_keys
       SET revoked_at = ?
       WHERE id = ? AND user_id = ? AND revoked_at IS NULL`,
    )
      .bind(nowUnix(), keyId, user.id)
      .run();

    if ((result.meta.changes ?? 0) === 0) {
      const exists = await c.env.DB.prepare(
        "SELECT id FROM api_keys WHERE id = ? AND user_id = ? LIMIT 1",
      )
        .bind(keyId, user.id)
        .first<{ id: string }>();
      if (!exists) return failure(c, 404, "API key not found", "NOT_FOUND");
    }
    return success(c, { success: true });
  }),
);

const projects = new Hono<AppContext>();
projects.use("*", requireAuth);
projects.use("*", rateLimitApiHourly);

projects.get("/", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const rows = await c.env.DB.prepare(
      `SELECT id, user_id, name, created_at, deleted_at
       FROM projects
       WHERE user_id = ? AND deleted_at IS NULL
       ORDER BY created_at DESC`,
    )
      .bind(user.id)
      .all<{
        id: string;
        user_id: string;
        name: string;
        created_at: number;
        deleted_at: number | null;
      }>();
    return success(c, rows.results ?? []);
  }),
);

projects.post("/", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const body = await parseBody(c);
    const parsed = projectCreateSchema.safeParse(body);
    if (!parsed.success) return validationFailure(c, parsed.error);

    const createdAt = nowUnix();
    const id = `prj_${nanoid(21)}`;
    await c.env.DB.prepare(
      `INSERT INTO projects (id, user_id, name, created_at, deleted_at)
       VALUES (?, ?, ?, ?, NULL)`,
    )
      .bind(id, user.id, parsed.data.name, createdAt)
      .run();

    return success(
      c,
      { id, user_id: user.id, name: parsed.data.name, created_at: createdAt, deleted_at: null },
      201,
    );
  }),
);

projects.delete("/:id", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const projectId = c.req.param("id");
    const result = await c.env.DB.prepare(
      `UPDATE projects
       SET deleted_at = ?
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
    )
      .bind(nowUnix(), projectId, user.id)
      .run();
    if ((result.meta.changes ?? 0) === 0) {
      return failure(c, 404, "Project not found", "NOT_FOUND");
    }
    return success(c, { success: true });
  }),
);

const agents = new Hono<AppContext>();
agents.use("*", requireAuth);
agents.use("*", rateLimitApiHourly);

agents.get("/", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const projectId = c.req.query("project_id");
    const params: unknown[] = [user.id];
    let sql =
      "SELECT a.id, a.project_id, a.name, a.endpoint_url, a.framework, a.created_at FROM agents AS a INNER JOIN projects AS p ON p.id = a.project_id WHERE p.user_id = ? AND p.deleted_at IS NULL";
    if (projectId) {
      sql += " AND a.project_id = ?";
      params.push(projectId);
    }
    sql += " ORDER BY a.created_at DESC";
    const rows = await c.env.DB.prepare(sql)
      .bind(...params)
      .all<{
        id: string;
        project_id: string;
        name: string;
        endpoint_url: string | null;
        framework: string | null;
        created_at: number;
      }>();
    return success(c, rows.results ?? []);
  }),
);

agents.post("/register", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const body = await parseBody(c);
    const parsed = agentRegisterSchema.safeParse(body);
    if (!parsed.success) return validationFailure(c, parsed.error);

    const project = await c.env.DB.prepare(
      `SELECT id FROM projects WHERE id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1`,
    )
      .bind(parsed.data.project_id, user.id)
      .first<{ id: string }>();
    if (!project) return failure(c, 403, "Project access denied", "FORBIDDEN");

    const existing = await c.env.DB.prepare(
      `SELECT id, name, project_id, created_at
       FROM agents
       WHERE project_id = ? AND name = ?
       LIMIT 1`,
    )
      .bind(parsed.data.project_id, parsed.data.name)
      .first<{ id: string; name: string; project_id: string; created_at: number }>();

    if (existing) {
      return success(c, {
        agent_id: existing.id,
        name: existing.name,
        project_id: existing.project_id,
        created_at: existing.created_at,
      });
    }

    const createdAt = nowUnix();
    const agentId = `agt_${nanoid(21)}`;
    await c.env.DB.prepare(
      `INSERT INTO agents (id, project_id, name, endpoint_url, framework, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        agentId,
        parsed.data.project_id,
        parsed.data.name,
        parsed.data.endpoint_url ?? null,
        parsed.data.framework ?? null,
        createdAt,
      )
      .run();

    return success(
      c,
      {
        agent_id: agentId,
        name: parsed.data.name,
        project_id: parsed.data.project_id,
        created_at: createdAt,
      },
      201,
    );
  }),
);

agents.get("/:id", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const agent = await getAgentOwnedByUser(c.env, user.id, c.req.param("id"));
    if (!agent) return failure(c, 404, "Agent not found", "NOT_FOUND");
    return success(c, agent);
  }),
);

agents.get("/:id/versions", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const agentId = c.req.param("id");
    const branch = c.req.query("branch") ?? "main";
    const agent = await getAgentOwnedByUser(c.env, user.id, agentId);
    if (!agent) return failure(c, 404, "Agent not found", "NOT_FOUND");

    const versions = await c.env.DB.prepare(
      `SELECT rv.id, rv.branch_name, rv.commit_message, rv.overall_severity, rv.created_at, rv.parent_version_id
       FROM run_versions AS rv
       INNER JOIN simulations AS s ON s.id = rv.simulation_id
       WHERE s.agent_id = ? AND s.user_id = ? AND rv.branch_name = ?
       ORDER BY rv.created_at DESC`,
    )
      .bind(agentId, user.id, branch)
      .all<{
        id: string;
        branch_name: string;
        commit_message: string | null;
        overall_severity: number | null;
        created_at: number;
        parent_version_id: string | null;
      }>();

    return success(
      c,
      (versions.results ?? []).map((version) => ({
        id: version.id,
        branch: version.branch_name,
        commit_message: version.commit_message,
        severity: version.overall_severity,
        created_at: version.created_at,
        parent_version_id: version.parent_version_id,
      })),
    );
  }),
);

agents.get("/:id/versions/:version_id/diff", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    if (user.tier === "free") {
      return failure(c, 403, "Upgrade to Pro to access version diffs.", "FORBIDDEN", {
        upgrade_url: UPGRADE_URL,
      });
    }

    const agentId = c.req.param("id");
    const versionId = c.req.param("version_id");
    const agent = await getAgentOwnedByUser(c.env, user.id, agentId);
    if (!agent) return failure(c, 404, "Agent not found", "NOT_FOUND");

    const version = await c.env.DB.prepare(
      `SELECT rv.id
       FROM run_versions AS rv
       INNER JOIN simulations AS s ON s.id = rv.simulation_id
       WHERE rv.id = ? AND s.agent_id = ? AND s.user_id = ?
       LIMIT 1`,
    )
      .bind(versionId, agentId, user.id)
      .first<{ id: string }>();
    if (!version) return failure(c, 404, "Version not found", "NOT_FOUND");

    const key = `traces/${agentId}/versions/${versionId}/diff.json.gz`;
    const object = await c.env.TRACES.get(key);
    if (!object) return failure(c, 404, "Diff not found", "NOT_FOUND");
    const diffJson = await readGzipJson(object);
    if (!diffJson) return failure(c, 500, "Unable to decode diff payload", "INTERNAL_ERROR");
    return success(c, diffJson);
  }),
);

agents.get("/:id/branches", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const agentId = c.req.param("id");
    const agent = await getAgentOwnedByUser(c.env, user.id, agentId);
    if (!agent) return failure(c, 404, "Agent not found", "NOT_FOUND");

    const rows = await c.env.DB.prepare(
      `SELECT id, name, head_version_id, created_at
       FROM branches
       WHERE agent_id = ?
       ORDER BY created_at DESC`,
    )
      .bind(agentId)
      .all<{ id: string; name: string; head_version_id: string | null; created_at: number }>();
    return success(c, rows.results ?? []);
  }),
);

agents.post("/:id/branches", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const agentId = c.req.param("id");
    const agent = await getAgentOwnedByUser(c.env, user.id, agentId);
    if (!agent) return failure(c, 404, "Agent not found", "NOT_FOUND");

    const body = await parseBody(c);
    const parsed = branchCreateSchema.safeParse(body);
    if (!parsed.success) return validationFailure(c, parsed.error);

    if (parsed.data.from_version_id) {
      const source = await c.env.DB.prepare(
        `SELECT rv.id
         FROM run_versions AS rv
         INNER JOIN simulations AS s ON s.id = rv.simulation_id
         WHERE rv.id = ? AND s.agent_id = ? AND s.user_id = ?
         LIMIT 1`,
      )
        .bind(parsed.data.from_version_id, agentId, user.id)
        .first<{ id: string }>();
      if (!source) return failure(c, 404, "Source version not found", "NOT_FOUND");
    }

    const branchId = `brh_${nanoid(21)}`;
    const createdAt = nowUnix();
    await c.env.DB.prepare(
      `INSERT INTO branches (id, agent_id, name, head_version_id, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(branchId, agentId, parsed.data.name, parsed.data.from_version_id ?? null, createdAt)
      .run();

    return success(
      c,
      {
        id: branchId,
        agent_id: agentId,
        name: parsed.data.name,
        head_version_id: parsed.data.from_version_id ?? null,
        created_at: createdAt,
      },
      201,
    );
  }),
);

const simulations = new Hono<AppContext>();
simulations.use("*", requireAuth);
simulations.use("*", rateLimitApiHourly);

simulations.get("/", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const projectId = c.req.query("project_id");
    const agentId = c.req.query("agent_id");
    const status = c.req.query("status");
    const limitRaw = Number(c.req.query("limit") ?? "20");
    const offsetRaw = Number(c.req.query("offset") ?? "0");
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.floor(limitRaw), 1), 100) : 20;
    const offset = Number.isFinite(offsetRaw) ? Math.max(Math.floor(offsetRaw), 0) : 0;

    const where: string[] = ["s.user_id = ?", "p.deleted_at IS NULL"];
    const params: unknown[] = [user.id];
    if (projectId) {
      where.push("a.project_id = ?");
      params.push(projectId);
    }
    if (agentId) {
      where.push("s.agent_id = ?");
      params.push(agentId);
    }
    if (status) {
      where.push("s.status = ?");
      params.push(status);
    }
    const whereSql = where.join(" AND ");

    const totalRow = await c.env.DB.prepare(
      `SELECT COUNT(*) AS total
       FROM simulations AS s
       INNER JOIN agents AS a ON a.id = s.agent_id
       INNER JOIN projects AS p ON p.id = a.project_id
       WHERE ${whereSql}`,
    )
      .bind(...params)
      .first<{ total: number }>();

    const data = await c.env.DB.prepare(
      `SELECT s.id, s.agent_id, s.user_id, s.parent_sim_id, s.status, s.config_json, s.summary_r2_key, s.started_at, s.completed_at, s.created_at
       FROM simulations AS s
       INNER JOIN agents AS a ON a.id = s.agent_id
       INNER JOIN projects AS p ON p.id = a.project_id
       WHERE ${whereSql}
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
    )
      .bind(...params, limit, offset)
      .all<{
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
      }>();

    return success(c, {
      total: toNumber(totalRow?.total) ?? 0,
      limit,
      offset,
      items: data.results ?? [],
    });
  }),
);

simulations.post("/", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const body = await parseBody(c);
    const parsed = simulationCreateSchema.safeParse(body);
    if (!parsed.success) return validationFailure(c, parsed.error);

    const agent = await getAgentOwnedByUser(c.env, user.id, parsed.data.agent_id);
    if (!agent) return failure(c, 403, "Agent access denied", "FORBIDDEN");

    const tierLimitResult = await enforceSimulationLaunchLimit(c.env, user.id, user.tier);
    if (!tierLimitResult.ok) {
      return tierLimit(c);
    }

    if (
      user.tier === "free" &&
      (parsed.data.categories.length > 3 ||
        parsed.data.categories.some(
          (category: AttackCategory) => !FREE_TIER_CATEGORIES.has(category),
        ))
    ) {
      return tierLimit(c);
    }

    if (!c.env.SIMULATION_QUEUE) {
      return failure(c, 500, "Simulation queue is not configured", "INTERNAL_ERROR");
    }

    const simulationId = `sim_${nanoid(21)}`;
    const createdAt = nowUnix();
    const configJson = JSON.stringify({
      categories: parsed.data.categories,
      threshold: parsed.data.threshold ?? null,
      config: parsed.data.config ?? {},
    });

    const statements: D1PreparedStatement[] = [
      c.env.DB.prepare(
        `INSERT INTO simulations
         (id, agent_id, user_id, parent_sim_id, status, config_json, summary_r2_key, started_at, completed_at, created_at)
         VALUES (?, ?, ?, NULL, 'queued', ?, NULL, NULL, NULL, ?)`,
      ).bind(simulationId, parsed.data.agent_id, user.id, configJson, createdAt),
    ];

    for (const category of parsed.data.categories) {
      statements.push(
        c.env.DB.prepare(
          `INSERT INTO sim_runs
           (id, simulation_id, category, status, severity, trace_r2_key, created_at)
           VALUES (?, ?, ?, 'pending', NULL, NULL, ?)`,
        ).bind(`run_${nanoid(21)}`, simulationId, category, createdAt),
      );
    }

    await c.env.DB.batch(statements);
    await c.env.SIMULATION_QUEUE.send({
      type: "simulate",
      simulation_id: simulationId,
      user_id: user.id,
    });

    return success(
      c,
      {
        simulation_id: simulationId,
        status: "queued",
        run_count: parsed.data.categories.length,
      },
      201,
    );
  }),
);

simulations.get("/:id", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const simulation = await getSimulationOwnedByUser(c.env, user.id, c.req.param("id"));
    if (!simulation) return failure(c, 404, "Simulation not found", "NOT_FOUND");
    const runs = await c.env.DB.prepare(
      `SELECT id, simulation_id, category, status, severity, trace_r2_key, created_at
       FROM sim_runs
       WHERE simulation_id = ?
       ORDER BY created_at ASC`,
    )
      .bind(simulation.id)
      .all<{
        id: string;
        simulation_id: string;
        category: string;
        status: string;
        severity: number | null;
        trace_r2_key: string | null;
        created_at: number;
      }>();
    return success(c, { simulation, sim_runs: runs.results ?? [] });
  }),
);

simulations.get("/:id/status", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const simulation = await getSimulationOwnedByUser(c.env, user.id, c.req.param("id"));
    if (!simulation) return failure(c, 404, "Simulation not found", "NOT_FOUND");

    const countRow = await c.env.DB.prepare(
      `SELECT
         COUNT(*) AS total_runs,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_runs
       FROM sim_runs
       WHERE simulation_id = ?`,
    )
      .bind(simulation.id)
      .first<{ total_runs: number; completed_runs: number | null }>();

    const severities = await c.env.DB.prepare(
      `SELECT category, severity
       FROM sim_runs
       WHERE simulation_id = ? AND severity IS NOT NULL`,
    )
      .bind(simulation.id)
      .all<{ category: string; severity: number }>();

    const severityByCategory: Record<string, number> = {};
    for (const row of severities.results ?? []) {
      severityByCategory[row.category] = row.severity;
    }

    return success(c, {
      status: simulation.status,
      completed_runs: toNumber(countRow?.completed_runs) ?? 0,
      total_runs: toNumber(countRow?.total_runs) ?? 0,
      severity_by_category: severityByCategory,
    });
  }),
);

simulations.get("/:id/report", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    if (user.tier === "free") {
      return failure(c, 403, "Upgrade to Pro to view simulation reports.", "FORBIDDEN", {
        upgrade_url: UPGRADE_URL,
      });
    }
    const simulation = await getSimulationOwnedByUser(c.env, user.id, c.req.param("id"));
    if (!simulation) return failure(c, 404, "Simulation not found", "NOT_FOUND");

    const key = simulation.summary_r2_key ?? `traces/${simulation.id}/summary.json.gz`;
    const object = await c.env.TRACES.get(key);
    if (!object) return failure(c, 404, "Report not found", "NOT_FOUND");
    const report = await readGzipJson(object);
    if (!report) return failure(c, 500, "Unable to decode report payload", "INTERNAL_ERROR");
    return success(c, report);
  }),
);

simulations.get("/:id/replay/:run_id", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    if (user.tier === "free") {
      return failure(c, 403, "Upgrade to Pro to replay runs.", "FORBIDDEN", {
        upgrade_url: UPGRADE_URL,
      });
    }

    const simulation = await getSimulationOwnedByUser(c.env, user.id, c.req.param("id"));
    if (!simulation) return failure(c, 404, "Simulation not found", "NOT_FOUND");
    const run = await c.env.DB.prepare(
      `SELECT id, trace_r2_key
       FROM sim_runs
       WHERE id = ? AND simulation_id = ?
       LIMIT 1`,
    )
      .bind(c.req.param("run_id"), simulation.id)
      .first<{ id: string; trace_r2_key: string | null }>();
    if (!run) return failure(c, 404, "Run not found", "NOT_FOUND");

    const key = run.trace_r2_key ?? `traces/${simulation.id}/runs/${run.id}/graph.json.gz`;
    const object = await c.env.TRACES.get(key);
    if (!object) return failure(c, 404, "Replay trace not found", "NOT_FOUND");
    const replay = await readGzipJson(object);
    if (!replay) return failure(c, 500, "Unable to decode replay payload", "INTERNAL_ERROR");
    return success(c, replay);
  }),
);

simulations.post("/:id/fork", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    if (user.tier === "free") {
      return failure(c, 403, "Upgrade to Pro to use fork and replay.", "FORBIDDEN", {
        upgrade_url: UPGRADE_URL,
      });
    }

    const simulation = await getSimulationOwnedByUser(c.env, user.id, c.req.param("id"));
    if (!simulation) return failure(c, 404, "Simulation not found", "NOT_FOUND");

    const body = await parseBody(c);
    const parsed = forkSchema.safeParse(body);
    if (!parsed.success) return validationFailure(c, parsed.error);
    if (!c.env.SIMULATION_QUEUE) {
      return failure(c, 500, "Simulation queue is not configured", "INTERNAL_ERROR");
    }

    const forkId = `sim_${nanoid(21)}`;
    const createdAt = nowUnix();
    await c.env.DB.prepare(
      `INSERT INTO simulations
       (id, agent_id, user_id, parent_sim_id, status, config_json, summary_r2_key, started_at, completed_at, created_at)
       VALUES (?, ?, ?, ?, 'queued', ?, NULL, NULL, NULL, ?)`,
    )
      .bind(
        forkId,
        simulation.agent_id,
        user.id,
        simulation.id,
        JSON.stringify({
          type: "fork",
          fork_from_node: parsed.data.fork_from_node,
          new_input: parsed.data.new_input,
        }),
        createdAt,
      )
      .run();

    await c.env.SIMULATION_QUEUE.send({
      type: "fork",
      simulation_id: forkId,
      parent_sim_id: simulation.id,
      fork_from_node: parsed.data.fork_from_node,
      new_input: parsed.data.new_input,
      user_id: user.id,
    });

    return success(
      c,
      {
        simulation_id: forkId,
        status: "queued",
      },
      201,
    );
  }),
);

simulations.post("/:id/cancel", async (c) =>
  withGuard(c, async () => {
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const simulation = await getSimulationOwnedByUser(c.env, user.id, c.req.param("id"));
    if (!simulation) return failure(c, 404, "Simulation not found", "NOT_FOUND");

    await c.env.DB.prepare(
      `UPDATE simulations
       SET status = 'failed', completed_at = ?
       WHERE id = ? AND user_id = ? AND status IN ('queued', 'running')`,
    )
      .bind(nowUnix(), simulation.id, user.id)
      .run();

    return success(c, { success: true });
  }),
);

const billing = new Hono<AppContext>();
billing.use("*", requireSession);
billing.use("*", rateLimitApiHourly);

billing.post("/checkout", async (c) =>
  withGuard(c, async () => {
    if (c.get("authMethod") !== "session") {
      return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    }
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");

    const body = await parseBody(c);
    const parsed = z.object({ tier: tierSchema }).safeParse(body);
    if (!parsed.success) return validationFailure(c, parsed.error);

    const appUser = await getAppUser(c);
    if (!appUser) return failure(c, 404, "User not found", "NOT_FOUND");
    const priceId =
      parsed.data.tier === "pro" ? c.env.STRIPE_PRO_PRICE_ID : c.env.STRIPE_TEAM_PRICE_ID;

    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("customer_email", appUser.email);
    params.set("metadata[user_id]", user.id);
    params.set("metadata[tier]", parsed.data.tier);
    params.set("success_url", `${c.env.APP_URL}/dashboard/settings?upgraded=true`);
    params.set("cancel_url", `${c.env.APP_URL}/dashboard/settings`);

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const payload = (await response.json()) as unknown;
    const record = toRecord(payload);
    const checkoutUrl = toString(record?.url);
    if (!response.ok || !checkoutUrl) {
      return failure(c, 500, "Failed to create Stripe checkout session", "INTERNAL_ERROR");
    }

    return success(c, { checkout_url: checkoutUrl });
  }),
);

billing.post("/portal", async (c) =>
  withGuard(c, async () => {
    if (c.get("authMethod") !== "session") {
      return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    }
    const user = c.get("user");
    if (!user) return failure(c, 401, "Unauthorized", "UNAUTHORIZED");
    const appUser = await getAppUser(c);
    if (!appUser) return failure(c, 404, "User not found", "NOT_FOUND");

    const customerId = await getStripeCustomerId(
      c.env,
      appUser.id,
      appUser.email,
      appUser.stripe_customer_id,
    );
    if (!customerId) {
      return failure(c, 500, "Failed to create Stripe customer", "INTERNAL_ERROR");
    }

    const params = new URLSearchParams();
    params.set("customer", customerId);
    params.set("return_url", `${c.env.APP_URL}/dashboard/settings`);
    const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const payload = (await response.json()) as unknown;
    const record = toRecord(payload);
    const portalUrl = toString(record?.url);
    if (!response.ok || !portalUrl) {
      return failure(c, 500, "Failed to create Stripe portal session", "INTERNAL_ERROR");
    }

    return success(c, { portal_url: portalUrl });
  }),
);

const webhooks = new Hono<AppContext>();
webhooks.post("/stripe", async (c) =>
  withGuard(c, async () => {
    const payload = await c.req.text();
    const signature = c.req.header("Stripe-Signature");
    const isValid = await verifyStripeSignature(payload, signature, c.env.STRIPE_WEBHOOK_SECRET);
    if (!isValid) {
      return failure(c, 401, "Invalid Stripe signature", "UNAUTHORIZED");
    }
    const parsedPayload: unknown = (() => {
      try {
        return JSON.parse(payload) as unknown;
      } catch {
        return null;
      }
    })();
    const event = toRecord(parsedPayload);
    if (!event) {
      return failure(c, 400, "Invalid Stripe event payload", "VALIDATION_ERROR");
    }
    c.executionCtx.waitUntil(processStripeEvent(c.env, event));
    return success(c, { received: true });
  }),
);

app.route("/api/v1/keys", keys);
app.route("/api/v1/projects", projects);
app.route("/api/v1/agents", agents);
app.route("/api/v1/simulations", simulations);
app.route("/api/v1/billing", billing);
app.route("/api/v1/webhooks", webhooks);

app.onError((err, c) => {
  console.error(err);
  if (c.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  return failure(c, 500, "Internal server error", "INTERNAL_ERROR");
});

app.notFound((c) =>
  failure(c, 404, "Not found", "NOT_FOUND"),
);

const handler: ExportedHandler<Env> = {
  async fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },
};

export default Sentry.withSentry(
  (env) => ({
    dsn: env.SENTRY_DSN || undefined,
    tracesSampleRate: 0,
  }),
  handler,
);
