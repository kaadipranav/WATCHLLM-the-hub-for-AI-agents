import { betterAuth } from "better-auth";
import { nanoid } from "nanoid";
import type { Env, UserRow, UserTier } from "@watchllm/types";

function isLocalAppUrl(appUrl: string): boolean {
  try {
    return new URL(appUrl).hostname === "localhost";
  } catch {
    return false;
  }
}

const nowUnix = (): number => Math.floor(Date.now() / 1000);

export async function findUserByEmail(env: Env, email: string): Promise<UserRow | null> {
  const row = await env.DB.prepare(
    `SELECT id, email, github_username, tier, created_at, stripe_customer_id, last_seen_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
  )
    .bind(email)
    .first<UserRow>();
  return row ?? null;
}

export async function upsertAppUserByEmail(
  env: Env,
  input: { email: string; githubUsername?: string | null },
): Promise<UserRow | null> {
  const existing = await findUserByEmail(env, input.email);
  const seenAt = nowUnix();

  if (!existing) {
    const id = `usr_${nanoid(21)}`;
    await env.DB.prepare(
      `INSERT INTO users (id, email, github_username, tier, created_at, stripe_customer_id, last_seen_at)
       VALUES (?, ?, ?, ?, ?, NULL, ?)`,
    )
      .bind(id, input.email, input.githubUsername ?? null, "free" satisfies UserTier, seenAt, seenAt)
      .run();
    return findUserByEmail(env, input.email);
  }

  await env.DB.prepare(
    `UPDATE users
     SET last_seen_at = ?, github_username = COALESCE(github_username, ?)
     WHERE id = ?`,
  )
    .bind(seenAt, input.githubUsername ?? null, existing.id)
    .run();

  return findUserByEmail(env, input.email);
}

export function createAuth(env: Env, requestUrl: string) {
  // Use APP_URL as baseURL. Since we are rewriting requests from the frontend, 
  // Better Auth should operate relative to the frontend domain for cookie consistency.
  const baseURL = env.APP_URL.replace(/\/$/, "");
  const trustedOrigins = isLocalAppUrl(env.APP_URL)
    ? [baseURL, new URL(requestUrl).origin]
    : [baseURL];

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL,
    basePath: "/api/v1/auth",
    database: env.DB,
    emailAndPassword: { enabled: false },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    trustedOrigins,
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await upsertAppUserByEmail(env, {
              email: user.email,
              githubUsername: user.name ?? null,
            });
          },
        },
        update: {
          after: async (user) => {
            await upsertAppUserByEmail(env, {
              email: user.email,
              githubUsername: user.name ?? null,
            });
          },
        },
      },
    },
  });
}

export async function getSession(request: Request, env: Env) {
  const auth = createAuth(env, request.url);
  return auth.api.getSession({ headers: request.headers });
}

/** Better Auth `handler` for Workers / Hono integration. */
export async function handleAuthRequest(request: Request, env: Env) {
  const auth = createAuth(env, request.url);
  return auth.handler(request);
}
