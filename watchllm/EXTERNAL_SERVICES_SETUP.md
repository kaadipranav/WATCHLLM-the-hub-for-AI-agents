# WatchLLM External Services Setup

This checklist includes every external service you need to configure manually for local + production deployment.

## 1) Cloudflare Account Resources (Required)

You must manually create and bind these resources in your Cloudflare account:

1. D1 database
- Name: watchllm-db
- Bind to Worker as DB
- Run SQL migrations from migrations/

2. R2 bucket
- Name: watchllm-traces
- Bind to Worker as TRACES

3. KV namespace
- Bind to Worker as KV
- Used for rate limits and usage counters

4. Queue
- Name: watchllm-simulations
- Producer binding on API worker: SIMULATION_QUEUE
- Consumer binding on orchestrator worker

5. Cloudflare AI binding
- Worker env: chaos
- Binding name: AI
- Model used: @cf/meta/llama-3.1-8b-instruct-fp8

6. Worker service bindings
- Orchestrator -> Chaos service binding: CHAOS_WORKER
- Optional fallback URL var: CHAOS_WORKER_URL

7. Fix placeholder IDs in wrangler.toml
- Replace REPLACE_WITH_ACTUAL_ID values under env.orchestrator and env.chaos:
  - env.orchestrator.d1_databases.database_id
  - env.orchestrator.kv_namespaces.id
  - env.chaos.d1_databases.database_id
  - env.chaos.kv_namespaces.id

## 2) GitHub OAuth App (Required for dashboard sign-in)

Create a GitHub OAuth App manually:

1. Homepage URL
- Local: http://localhost:3000
- Prod: your app URL

2. Authorization callback URL
- Local: http://localhost:8787/api/v1/auth/callback/github
- Prod: https://<api-domain>/api/v1/auth/callback/github

3. Copy credentials into worker secrets
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET

## 3) Stripe (Required for paid plans)

Manual Stripe setup:

1. Create products/prices
- Pro monthly price -> STRIPE_PRO_PRICE_ID
- Team monthly price -> STRIPE_TEAM_PRICE_ID

2. Create API key secret
- STRIPE_SECRET_KEY

3. Create webhook endpoint
- URL: /api/v1/webhooks/stripe on your API deployment
- Events to include:
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
- Secret -> STRIPE_WEBHOOK_SECRET

## 4) Better Auth Secret (Required)

Generate and set:
- BETTER_AUTH_SECRET

## 5) Sentry (Optional but recommended)

Manual Sentry setup:

1. Create project (Cloudflare Workers)
2. Add DSN as worker secret
- SENTRY_DSN

If omitted, app still runs; errors are not reported to Sentry.

## 6) Frontend/Runtime URL Configuration (Required)

1. APP_URL (Worker var)
- Must be the frontend base URL used for OAuth callback and billing redirects

2. NEXT_PUBLIC_API_URL (web env var)
- Set when frontend and API are on different origins
- If not set, Next rewrite defaults to http://127.0.0.1:8787

## 7) Secrets Manager (Optional workflow)

Architecture notes mention Doppler, but the code does not require Doppler.

You can manage secrets manually with Wrangler (works fine):
- wrangler secret put BETTER_AUTH_SECRET
- wrangler secret put GITHUB_CLIENT_ID
- wrangler secret put GITHUB_CLIENT_SECRET
- wrangler secret put STRIPE_SECRET_KEY
- wrangler secret put STRIPE_WEBHOOK_SECRET
- wrangler secret put STRIPE_PRO_PRICE_ID
- wrangler secret put STRIPE_TEAM_PRICE_ID
- wrangler secret put SENTRY_DSN

## 8) Sanity check before first prod run

1. D1 migrations applied
2. Queue exists and is attached to both producer and consumer
3. R2 and KV bindings resolve in all worker envs
4. OAuth callback URL points to API worker origin
5. Stripe webhook delivers successfully
6. APP_URL matches deployed frontend URL
