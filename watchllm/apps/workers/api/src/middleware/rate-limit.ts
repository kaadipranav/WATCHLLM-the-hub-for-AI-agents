import type { Env, UserTier } from "@watchllm/types";
import type { MiddlewareHandler } from "hono";
import type { AuthedUser } from "./auth";

const HOUR_MS = 60 * 60 * 1000;
const API_HOURLY_LIMIT = 1000;
const FREE_SIMULATIONS_PER_MONTH = 5;

/**
 * Sliding-window style limiter using stored request timestamps in KV.
 */
async function slidingWindowAllow(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const now = Date.now();
  const raw = await kv.get(key);
  let stamps: number[] = [];
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        stamps = parsed.filter((t): t is number => typeof t === "number");
      }
    } catch {
      stamps = [];
    }
  }
  const cutoff = now - windowMs;
  stamps = stamps.filter((t) => t > cutoff);
  if (stamps.length >= limit) return false;
  stamps.push(now);
  await kv.put(key, JSON.stringify(stamps), {
    expirationTtl: Math.ceil(windowMs / 1000) + 120,
  });
  return true;
}

/** 1000 authenticated API requests / hour per user (all tiers). */
export const rateLimitApiHourly: MiddlewareHandler<{
  Bindings: Env;
  Variables: { user?: AuthedUser };
}> = async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return await next();
  }
  const key = `rl:${user.id}:hourly`;
  const allowed = await slidingWindowAllow(c.env.KV, key, API_HOURLY_LIMIT, HOUR_MS);
  if (!allowed) {
    return c.json(
      {
        data: null,
        error: { message: "Too many requests", code: "rate_limited" },
      },
      429,
    );
  }
  return await next();
};

function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Call when launching a simulation. Free tier: max 5 simulations / calendar month.
 */
export async function enforceSimulationLaunchLimit(
  env: Env,
  userId: string,
  tier: UserTier,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (tier !== "free") return { ok: true };
  const key = `rl:${userId}:${monthKey()}`;
  const raw = await env.KV.get(key);
  const count = raw ? Number(raw) : 0;
  if (!Number.isFinite(count) || count < 0) {
    await env.KV.put(key, "1", { expirationTtl: 40 * 24 * 60 * 60 });
    return { ok: true };
  }
  if (count >= FREE_SIMULATIONS_PER_MONTH) {
    return {
      ok: false,
      message: "Free tier allows 5 simulations per month.",
    };
  }
  await env.KV.put(key, String(count + 1), { expirationTtl: 40 * 24 * 60 * 60 });
  return { ok: true };
}
