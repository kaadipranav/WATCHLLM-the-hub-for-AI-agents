import type { MiddlewareHandler } from "hono";
import bcrypt from "bcryptjs";
import type { Env, UserTier } from "@watchllm/types";
import { getSession, upsertAppUserByEmail } from "../auth";

export type AuthedUser = {
  id: string;
  email: string;
  tier: UserTier;
};

export type AuthMethod = "session" | "api_key";

function parseUserTier(value: string): UserTier {
  if (value === "free" || value === "pro" || value === "team") return value;
  return "free";
}

const API_KEY_PREFIX_LEN = 12;

type AuthedContext = { Bindings: Env; Variables: { user?: AuthedUser; authMethod?: AuthMethod } };

const unauthorized = (c: Parameters<MiddlewareHandler<AuthedContext>>[0]): Response =>
  c.json(
    { data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
    401,
  );

async function sessionUser(c: Parameters<MiddlewareHandler<AuthedContext>>[0]): Promise<AuthedUser | null> {
  const session = await getSession(c.req.raw, c.env);
  if (!session?.user?.email) {
    return null;
  }
  const user = await upsertAppUserByEmail(c.env, {
    email: session.user.email,
    githubUsername: session.user.name ?? null,
  });
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    tier: parseUserTier(user.tier),
  };
}

async function apiKeyUser(c: Parameters<MiddlewareHandler<AuthedContext>>[0]): Promise<AuthedUser | null> {
  const raw = c.req.header("X-WatchLLM-Api-Key");
  if (!raw?.trim()) {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  const apiKey = raw.trim();
  const prefix = apiKey.length >= API_KEY_PREFIX_LEN ? apiKey.slice(0, API_KEY_PREFIX_LEN) : apiKey;
  const row = await c.env.DB.prepare(
    `SELECT ak.id AS api_key_id, ak.key_hash AS key_hash, u.id AS user_id, u.email AS user_email, u.tier AS user_tier
     FROM api_keys AS ak
     INNER JOIN users AS u ON u.id = ak.user_id
     WHERE ak.key_prefix = ?
       AND ak.revoked_at IS NULL
       AND (ak.expires_at IS NULL OR ak.expires_at > ?)
     LIMIT 1`,
  )
    .bind(prefix, now)
    .first<{
      api_key_id: string;
      key_hash: string;
      user_id: string;
      user_email: string;
      user_tier: string;
    }>();

  if (!row) {
    return null;
  }

  const matches = await bcrypt.compare(apiKey, row.key_hash);
  if (!matches) {
    return null;
  }

  await c.env.DB.prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?")
    .bind(now, row.api_key_id)
    .run();

  return {
    id: row.user_id,
    email: row.user_email,
    tier: parseUserTier(row.user_tier),
  };
}

export const requireSession: MiddlewareHandler<AuthedContext> =
  async (c, next) => {
    const user = await sessionUser(c);
    if (!user) return unauthorized(c);
    c.set("user", user);
    c.set("authMethod", "session");
    return await next();
  };

export const requireApiKey: MiddlewareHandler<AuthedContext> =
  async (c, next) => {
    const user = await apiKeyUser(c);
    if (!user) return unauthorized(c);
    c.set("user", user);
    c.set("authMethod", "api_key");
    return await next();
  };

export const requireAuth: MiddlewareHandler<AuthedContext> =
  async (c, next) => {
    const viaSession = await sessionUser(c);
    if (viaSession) {
      c.set("user", viaSession);
      c.set("authMethod", "session");
      return await next();
    }
    const viaApiKey = await apiKeyUser(c);
    if (viaApiKey) {
      c.set("user", viaApiKey);
      c.set("authMethod", "api_key");
      return await next();
    }
    return unauthorized(c);
  };
