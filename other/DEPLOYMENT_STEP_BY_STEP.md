# WatchLLM Complete Deployment Guide

## Phase 1: Cloudflare Resource Setup

### Step 1.1: Create Cloudflare D1 Database

**Why**: SQLite database at the edge for storing users, projects, agents, simulations, and runs.

**Instructions:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Left sidebar → **D1** → **Create database**
3. Name: `watchllm-db`
4. Choose **Production** location
5. Click **Create database**
6. Once created, open the database and copy the **Database ID** (UUID format)
7. **Save this ID** - you'll need it in wrangler.toml

**Example ID format:** `12345678-abcd-efgh-ijkl-mnopqrstuvwx`

---

### Step 1.2: Create Cloudflare R2 Bucket

**Why**: Object storage for trace graphs and simulation recordings (gzip-compressed JSON).

**Instructions:**
1. Left sidebar → **R2 Object Storage** → **Create bucket**
2. Name: `watchllm-traces`
3. Uncheck "Block public access" if you want CDN distribution (optional)
4. Click **Create bucket**
5. Once created, go to bucket settings and copy the **Bucket Name**: `watchllm-traces`

**Note:** R2 is automatically bound; you just need the bucket name in wrangler.toml

---

### Step 1.3: Create Cloudflare KV Namespace

**Why**: Fast key-value storage for rate limits, session state, and caching.

**Instructions:**
1. Left sidebar → **Workers & Pages** → **KV** → **Create a namespace**
2. Name: `watchllm-kv`
3. Click **Create**
4. Copy the **Namespace ID** (UUID format)

**Save this ID** - you'll need it in wrangler.toml

---

### Step 1.4: Create Cloudflare Queue

**Why**: Async job queue for dispatching simulation runs from API to Orchestrator Worker.

**Instructions:**
1. Left sidebar → **Workers & Pages** → **Queues** → **Create Queue**
2. Name: `simulation-queue`
3. Click **Create queue**

**Note:** No ID to copy; Wrangler automatically binds by name

---

### Step 1.5: Enable Cloudflare AI

**Why**: Run Llama 3.1 model in Chaos Worker for LLM-based attack evaluation.

**Instructions:**
1. Left sidebar → **Workers & Pages** → **AI** 
2. Click **Enable AI**
3. No configuration needed; automatically bound in Workers

---

## Phase 2: GitHub OAuth Setup

### Step 2.1: Create GitHub OAuth App

**Why**: Enable "Sign in with GitHub" for dashboard authentication.

**Instructions:**
1. Go to [GitHub Settings → Developer Settings](https://github.com/settings/developers) (or [github.com/settings/apps](https://github.com/settings/apps) for GitHub Apps)
2. Click **OAuth Apps** → **New OAuth App** (or **New GitHub App** if using Apps)
3. Fill in:
   - **Application name**: `WatchLLM (Local Dev)` or `WatchLLM (Production)`
   - **Homepage URL**: 
     - Local: `http://localhost:3000`
     - Production: `https://your-domain.com`
   - **Authorization callback URL**: 
     - Local: `http://localhost:8787/api/v1/auth/callback/github`
     - Production: `https://api.your-domain.com/api/v1/auth/callback/github`
   - **Description**: `AI Agent Stress Testing Platform`
4. Uncheck "Expire user authorization tokens" (let sessions persist)
5. Click **Create OAuth application**
6. Copy the following:
   - **Client ID** → Save as `GITHUB_CLIENT_ID`
   - **Client Secret** → Click "Generate a new client secret" → Copy → Save as `GITHUB_CLIENT_SECRET`

**Important:** Client Secret is shown only once. Store it securely.

---

## Phase 3: Stripe Billing Setup

### Step 3.1: Create Stripe Products

**Why**: Define Pro and Team subscription tiers with monthly pricing.

**Instructions:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Left sidebar → **Products** → **+ Add product**

**Create Product 1: Pro Plan**
- **Name**: `WatchLLM Pro`
- **Description**: `Professional tier with advanced features`
- **Pricing model**: **Recurring**
- **Price**: $29.99 / month
- Check "This product has multiple prices" → Add another price at $299.99/year (optional)
- **Save**
- Copy the **Price ID** (starts with `price_`) → Save as `STRIPE_PRO_PRICE_ID`

**Create Product 2: Team Plan**
- **Name**: `WatchLLM Team`
- **Description**: `Team tier with collaboration and higher limits`
- **Pricing model**: **Recurring**
- **Price**: $99.99 / month
- **Save**
- Copy the **Price ID** → Save as `STRIPE_TEAM_PRICE_ID`

---

### Step 3.2: Get Stripe API Keys

**Instructions:**
1. Left sidebar → **Developers** → **API Keys**
2. Copy the **Secret key** (starts with `sk_live_` or `sk_test_`)
3. Save as `STRIPE_SECRET_KEY`

**For Testing:** Use `sk_test_*` during development; switch to `sk_live_*` at production.

---

### Step 3.3: Create Stripe Webhook Endpoint

**Why**: Listen for subscription events (payments, cancellations, etc.) and update the database.

**Instructions:**
1. Left sidebar → **Developers** → **Events** → **Webhooks** → **+ Add endpoint**
2. **Endpoint URL**: 
   - Local: `http://localhost:8787/api/v1/webhooks/stripe`
   - Production: `https://api.your-domain.com/api/v1/webhooks/stripe`
3. **Events to send**:
   - Check `customer.subscription.created`
   - Check `customer.subscription.updated`
   - Check `customer.subscription.deleted`
   - Check `charge.succeeded`
   - Check `charge.failed`
4. Click **Add endpoint**
5. Open the webhook endpoint
6. Copy the **Signing secret** (starts with `whsec_` or `we_`) → Save as `STRIPE_WEBHOOK_SECRET`

---

## Phase 4: Better Auth Secret Generation

### Step 4.1: Generate BETTER_AUTH_SECRET

**Why**: Cryptographic key for session signing and security.

**Instructions:**

**Option A: Using Node.js (Recommended)**
```powershell
cd "d:\PRANAV APPS\WATCHLLM - Stress test your agent\watchllm"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (64-character hex string) → Save as `BETTER_AUTH_SECRET`

**Option B: Using PowerShell**
```powershell
[Convert]::ToHexString([byte[]]@((1..32 | ForEach-Object { Get-Random -Maximum 256 })))
```

**Option C: Manual (Quick)**
Use an online generator like [randomkeygen.com](https://randomkeygen.com) and copy a 64+ character string.

---

## Phase 5: Sentry Setup (Optional but Recommended)

### Step 5.1: Create Sentry Project

**Instructions:**
1. Go to [Sentry.io](https://sentry.io)
2. Sign up or log in
3. Left sidebar → **Projects** → **Create Project**
4. Select **Node.js**
5. Name: `watchllm-api`
6. Click **Create Project**
7. Copy the **DSN** (looks like `https://xxxxx@xxxxx.ingest.sentry.io/123456`)
8. Save as `SENTRY_DSN`

**Note:** This is optional. If you skip it, API worker will gracefully skip error reporting.

---

## Phase 6: Update wrangler.toml with Cloudflare IDs

### Step 6.1: Fill in Placeholder IDs

**File location:** `watchllm/wrangler.toml`

**Open the file and find these sections:**

**Orchestrator Environment (around line 140-160):**
```toml
[env.orchestrator.vars]
CHAOS_WORKER_URL = ""  # Leave empty (uses service binding)

[env.orchestrator]
d1_databases = [
  { binding = "database", id = "REPLACE_WITH_ACTUAL_ID" }  # ← Replace with D1 ID
]

kv_namespaces = [
  { binding = "kv", id = "REPLACE_WITH_ACTUAL_ID" }  # ← Replace with KV ID
]

workers_kv_namespace = [
  { binding = "RATE_LIMIT", id = "REPLACE_WITH_ACTUAL_ID" }  # ← Replace with KV ID
]
```

**Chaos Environment (around line 165-180):**
```toml
[env.chaos]
d1_databases = [
  { binding = "database", id = "REPLACE_WITH_ACTUAL_ID" }  # ← Replace with D1 ID
]

kv_namespaces = [
  { binding = "kv", id = "REPLACE_WITH_ACTUAL_ID" }  # ← Replace with KV ID
]
```

**Replace all `REPLACE_WITH_ACTUAL_ID` with:**
- **D1 ID** from Step 1.1
- **KV ID** from Step 1.3

**Example after replacement:**
```toml
d1_databases = [
  { binding = "database", id = "12345678-abcd-efgh-ijkl-mnopqrstuvwx" }
]

kv_namespaces = [
  { binding = "kv", id = "87654321-zyxw-vuts-rqpo-nmlkjihgfedcba" }
]
```

---

### Step 6.2: Update APP_URL in wrangler.toml

**Find line with `[vars]` (around line 100):**
```toml
[vars]
APP_URL = "http://localhost:3000"  # For local development
QUEUE_NAME = "simulation-queue"
TRACES_BUCKET = "watchllm-traces"
```

**For production deployment, change to:**
```toml
APP_URL = "https://api.your-domain.com"  # Change to your actual API domain
```

**For now, keep as `http://localhost:3000` for local testing.**

---

## Phase 7: Set Secrets via Wrangler CLI

### Step 7.1: Authenticate with Cloudflare

```powershell
cd "d:\PRANAV APPS\WATCHLLM - Stress test your agent\watchllm"
wrangler login
```

**This opens a browser to authorize Wrangler. Allow access.**

---

### Step 7.2: Set API Worker Secrets (Default Environment)

**These 8 secrets go into the main API worker:**

```powershell
# 1. Better Auth Secret (use the value from Step 4.1)
wrangler secret put BETTER_AUTH_SECRET
# → Paste the 64-character hex string and press Enter

# 2. GitHub OAuth Client ID (from Step 2.1)
wrangler secret put GITHUB_CLIENT_ID
# → Paste the GitHub Client ID and press Enter

# 3. GitHub OAuth Client Secret (from Step 2.1)
wrangler secret put GITHUB_CLIENT_SECRET
# → Paste the GitHub Client Secret and press Enter

# 4. Stripe Secret API Key (from Step 3.2)
wrangler secret put STRIPE_SECRET_KEY
# → Paste the Stripe Secret Key and press Enter

# 5. Stripe Webhook Secret (from Step 3.3)
wrangler secret put STRIPE_WEBHOOK_SECRET
# → Paste the Stripe Webhook Secret and press Enter

# 6. Stripe Pro Price ID (from Step 3.1)
wrangler secret put STRIPE_PRO_PRICE_ID
# → Paste the Pro Price ID and press Enter

# 7. Stripe Team Price ID (from Step 3.1)
wrangler secret put STRIPE_TEAM_PRICE_ID
# → Paste the Team Price ID and press Enter

# 8. Sentry DSN (from Step 5.1 - OPTIONAL)
wrangler secret put SENTRY_DSN
# → Paste the Sentry DSN and press Enter (or just press Enter to skip)
```

---

### Step 7.3: Set Orchestrator Worker Secrets

**Only 1 optional secret for Orchestrator:**

```powershell
# Sentry DSN (same as API worker - OPTIONAL)
wrangler secret put SENTRY_DSN --env orchestrator
# → Paste the Sentry DSN and press Enter (or skip)
```

---

### Step 7.4: Chaos Worker Secrets

**No secrets needed for Chaos Worker** (uses Cloudflare AI binding)

---

## Phase 8: Frontend Environment Variables

### Step 8.1: Create .env.local for Development

**File location:** `watchllm/apps/web/.env.local`

**Create the file with:**
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8787
```

**For production deployment, change to:**
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

---

## Phase 9: Database Migration

### Step 9.1: Run Migrations

**This creates tables in the D1 database:**

```powershell
cd "d:\PRANAV APPS\WATCHLLM - Stress test your agent\watchllm"

# Run all migrations
wrangler d1 execute watchllm-db --file migrations/001_initial_schema.sql
wrangler d1 execute watchllm-db --file migrations/002_indexes.sql
wrangler d1 execute watchllm-db --file migrations/003_rls_seed.sql
```

**Expected output:** No errors, just confirmation that migrations ran.

---

## Phase 10: Local Testing

### Step 10.1: Start Development Environment

```powershell
cd "d:\PRANAV APPS\WATCHLLM - Stress test your agent\watchllm"

# Terminal 1: Start API + Orchestrator Workers (local)
npm run dev

# Terminal 2: Start Frontend (Next.js)
cd apps/web
npm run dev
```

**Access:**
- Frontend: `http://localhost:3000`
- API Worker: `http://localhost:8787`
- Dashboard: `http://localhost:3000/dashboard`

**Test Sign In:**
1. Go to `http://localhost:3000`
2. Click **Sign In**
3. Click **Sign in with GitHub**
4. Authorize with your GitHub account
5. You should be redirected to the dashboard

---

## Phase 11: Production Deployment

### Step 11.1: Update Configuration for Production

**1. Update APP_URL in wrangler.toml:**
```toml
[vars]
APP_URL = "https://api.your-domain.com"
```

**2. Update NEXT_PUBLIC_API_URL in apps/web/.env.production (create if needed):**
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

**3. Update GitHub OAuth Callback URLs:**
   - Go to GitHub Settings → OAuth Apps → Your app
   - Update Authorization callback URL to: `https://api.your-domain.com/api/v1/auth/callback/github`

**4. Update Stripe Webhook Endpoint:**
   - Go to Stripe Dashboard → Webhooks
   - Update to: `https://api.your-domain.com/api/v1/webhooks/stripe`

---

### Step 11.2: Deploy Workers to Production

```powershell
cd "d:\PRANAV APPS\WATCHLLM - Stress test your agent\watchllm"

# Deploy all three workers
npm run deploy:workers

# Or individually:
wrangler deploy                    # API Worker
wrangler deploy --env orchestrator # Orchestrator Worker
wrangler deploy --env chaos        # Chaos Worker
```

---

### Step 11.3: Deploy Frontend to Cloudflare Pages

**Prerequisites:**
- GitHub repository is public or you have Pages access
- `wrangler.toml` is committed to the repo

**Instructions:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Left sidebar → **Pages** → **Create a project** → **Connect to Git**
3. Select your GitHub repository
4. **Framework preset**: Select **Next.js**
5. **Build command**: `npm run build`
6. **Build output directory**: `apps/web/.next`
7. Add environment variables:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://api.your-domain.com`
8. Click **Save and Deploy**

**Alternative: Manual deployment with Wrangler:**
```powershell
cd "d:\PRANAV APPS\WATCHLLM - Stress test your agent\watchllm\apps\web"
npm run build
wrangler pages deploy out --project-name watchllm
```

---

## Phase 12: Verification Checklist

- [ ] D1 Database created and ID saved
- [ ] R2 Bucket created and name confirmed
- [ ] KV Namespace created and ID saved
- [ ] Queue created and name confirmed
- [ ] GitHub OAuth App created and credentials saved
- [ ] Stripe Products created with Price IDs
- [ ] Stripe Webhook endpoint created and signing secret saved
- [ ] Better Auth Secret generated (64-char hex)
- [ ] Sentry project created (optional) and DSN saved
- [ ] wrangler.toml updated with all Cloudflare IDs
- [ ] .env.local created in apps/web for local dev
- [ ] All 8 API worker secrets set via Wrangler
- [ ] Orchestrator worker Sentry secret set (optional)
- [ ] Database migrations executed successfully
- [ ] Local development environment tested (sign-in works)
- [ ] Production URLs updated in all configs
- [ ] Workers deployed to Cloudflare
- [ ] Frontend deployed to Cloudflare Pages
- [ ] Production sign-in tested with GitHub OAuth
- [ ] Stripe billing flow tested (checkout works)

---

## Troubleshooting

### Secret Not Found Error
**Problem:** `Error: BETTER_AUTH_SECRET is undefined`

**Solution:**
1. Verify secret was set: `wrangler secret list`
2. If not listed, run: `wrangler secret put BETTER_AUTH_SECRET`
3. Redeploy: `wrangler deploy`

### Database Connection Failed
**Problem:** `Error: D1 database not found`

**Solution:**
1. Verify D1 ID in wrangler.toml matches Cloudflare dashboard
2. Run migrations: `wrangler d1 execute watchllm-db --file migrations/001_initial_schema.sql`

### OAuth Callback Error
**Problem:** `Invalid redirect_uri on GitHub callback`

**Solution:**
1. Go to GitHub OAuth app settings
2. Update "Authorization callback URL" to match exactly:
   - Local: `http://localhost:8787/api/v1/auth/callback/github`
   - Production: `https://api.your-domain.com/api/v1/auth/callback/github`

### Stripe Payment Failed
**Problem:** `Stripe API error: Invalid API Key`

**Solution:**
1. Verify using `sk_test_*` for development (not `sk_live_*`)
2. Confirm price IDs exist in Stripe dashboard
3. Redeploy: `wrangler deploy`

---

## Next Steps After Deployment

1. **Monitor Production:** Set up Sentry alerts and dashboards
2. **Set Up Billing Webhooks:** Test subscription creation and cancellation
3. **Create Initial Projects:** Via dashboard or SDK
4. **Configure Rate Limiting:** Adjust in `apps/workers/api/src/middleware/rate-limit.ts`
5. **Enable Analytics:** Integrate Cloudflare Analytics Engine (optional)

---

## Support Resources

- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- Stripe API Docs: https://stripe.com/docs/api
- Better Auth Docs: https://www.betterauth.dev/
- GitHub OAuth Docs: https://docs.github.com/en/developers/apps/building-oauth-apps
- Next.js Deployment: https://nextjs.org/docs/deployment

