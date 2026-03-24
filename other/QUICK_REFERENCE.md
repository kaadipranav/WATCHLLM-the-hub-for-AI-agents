# WatchLLM Quick Reference Card

## Critical Passwords & Secrets (Save These Securely)

### From GitHub OAuth Setup
- **GITHUB_CLIENT_ID**: `[Save from GitHub Settings → OAuth Apps]`
- **GITHUB_CLIENT_SECRET**: `[Save from GitHub Settings → OAuth Apps]`

### From Stripe Setup
- **STRIPE_SECRET_KEY**: `[Save from Stripe Dashboard → Developers → API Keys]` (use sk_test_* or sk_live_*)
- **STRIPE_WEBHOOK_SECRET**: `[Save from Stripe Dashboard → Webhooks]`
- **STRIPE_PRO_PRICE_ID**: `[Save from Stripe Products]` (e.g., price_1234567890)
- **STRIPE_TEAM_PRICE_ID**: `[Save from Stripe Products]` (e.g., price_0987654321)

### From Sentry (Optional)
- **SENTRY_DSN**: `[Save from Sentry Project Settings]`

### Generated Locally
- **BETTER_AUTH_SECRET**: `[Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]`

---

## Cloudflare Resources Created

| Resource | Name | ID/Reference | Status |
|----------|------|-------------|---------|
| D1 Database | watchllm-db | `[SAVE THIS]` | ⏳ |
| R2 Bucket | watchllm-traces | watchllm-traces | ⏳ |
| KV Namespace | watchllm-kv | `[SAVE THIS]` | ⏳ |
| Queue | simulation-queue | (by name) | ⏳ |
| AI Binding | (Auto) | (Auto) | ✅ |

---

## URLs to Update (Production)

| Service | Dev URL | Prod URL | Status |
|---------|---------|----------|---------|
| API Worker | http://localhost:8787 | https://api.your-domain.com | ⏳ |
| Frontend | http://localhost:3000 | https://your-domain.com | ⏳ |
| GitHub Callback | http://localhost:8787/api/v1/auth/callback/github | https://api.your-domain.com/api/v1/auth/callback/github | ⏳ |
| Stripe Webhook | http://localhost:8787/api/v1/webhooks/stripe | https://api.your-domain.com/api/v1/webhooks/stripe | ⏳ |

---

## Phase Checklist

### Phase 1: Cloudflare Resources ⏳
- [ ] D1 Database created → ID copied
- [ ] R2 Bucket created → Name: watchllm-traces
- [ ] KV Namespace created → ID copied
- [ ] Queue created → Name: simulation-queue
- [ ] AI enabled → No action needed

### Phase 2: GitHub OAuth ⏳
- [ ] OAuth App created
- [ ] Client ID copied
- [ ] Client Secret copied and stored securely
- [ ] Callback URLs set

### Phase 3: Stripe ✅
- [ ] Pro product created → Price ID copied
- [ ] Team product created → Price ID copied
- [ ] API Secret key copied
- [ ] Webhook endpoint created → Secret copied

### Phase 4: Auth Secret ⏳
- [ ] BETTER_AUTH_SECRET generated (64-char hex)

### Phase 5: Sentry (Optional) ⏳
- [ ] Project created → DSN copied (or skipped)

### Phase 6: Update wrangler.toml ⏳
- [ ] D1 ID replaced in [env.orchestrator]
- [ ] D1 ID replaced in [env.chaos]
- [ ] KV IDs replaced (3 places)
- [ ] APP_URL updated (for production)

### Phase 7: Wrangler Login ⏳
```powershell
wrangler login
```

### Phase 8: Set Secrets (8 commands) ⏳
```powershell
# Each one prompts for input, paste value and press Enter
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put STRIPE_PRO_PRICE_ID
wrangler secret put STRIPE_TEAM_PRICE_ID
wrangler secret put SENTRY_DSN  # Optional
```

### Phase 9: Orchestrator Secret (Optional) ⏳
```powershell
wrangler secret put SENTRY_DSN --env orchestrator
```

### Phase 10: Frontend .env.local ⏳
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8787
```

### Phase 11: Run Migrations ⏳
```powershell
wrangler d1 execute watchllm-db --file migrations/001_initial_schema.sql
wrangler d1 execute watchllm-db --file migrations/002_indexes.sql
wrangler d1 execute watchllm-db --file migrations/003_rls_seed.sql
```

### Phase 12: Local Testing ⏳
```powershell
# Terminal 1
npm run dev

# Terminal 2
cd apps/web && npm run dev

# Test at http://localhost:3000 → Sign In → GitHub
```

### Phase 13: Deploy to Production ⏳
```powershell
npm run deploy:workers
# Then deploy frontend via Cloudflare Pages
```

---

## Verification Commands

```powershell
# Check secrets were set
wrangler secret list

# Check D1 database
wrangler d1 info watchllm-db

# List local workers
wrangler workers list

# Test local deployment
npm run dev
```

---

## Troubleshooting Quick Links

| Error | Solution |
|-------|----------|
| `BETTER_AUTH_SECRET is undefined` | Run `wrangler secret put BETTER_AUTH_SECRET` and redeploy |
| `D1 database not found` | Check ID in wrangler.toml matches Cloudflare |
| `Invalid redirect_uri (GitHub)` | Update GitHub OAuth app callback URL exactly |
| `Stripe API error: Invalid API Key` | Verify using `sk_test_*` for dev, `sk_live_*` for prod |
| `Port 8787 already in use` | Kill existing process: `Get-Process node \| Stop-Process` |

---

## Success Indicators

✅ **Local Dev Ready:**
- `http://localhost:3000` loads
- "Sign In with GitHub" button works
- Dashboard accessible after sign-in
- No console errors in browser

✅ **Production Ready:**
- `https://your-domain.com` loads
- All redirects work
- Stripe checkout launches
- Simulations can be created and run
- Analytics page shows data

---

## Time Estimates

| Phase | Time |
|-------|------|
| Cloudflare Resources | 5 min |
| GitHub OAuth | 3 min |
| Stripe Setup | 10 min |
| Secret Generation | 2 min |
| wrangler.toml Update | 3 min |
| Wrangler Login | 2 min |
| Set 9 Secrets | 3 min |
| Database Migrations | 2 min |
| Local Test | 5 min |
| Production Deploy | 5 min |
| **Total** | **~40 min** |

---

## Important Notes

⚠️ **Backup Your Secrets:**
- Store STRIPE_WEBHOOK_SECRET and GITHUB_CLIENT_SECRET in a password manager
- These cannot be recovered after creation

⚠️ **Use Test Keys First:**
- Start with `sk_test_*` Stripe keys
- Use GitHub OAuth testing app before production app
- Test everything locally before deploying

⚠️ **Verify URLs Match:**
- GitHub OAuth callback must match exactly
- Stripe webhook URL must be accessible publicly
- APP_URL in wrangler.toml must be correct for OAuth redirects

⚠️ **Don't Commit Secrets:**
- Never push .env files to Git
- Use Wrangler secrets, not wrangler.toml for sensitive data
- Check `.gitignore` includes all secret files

---

## Need Help?

See detailed instructions in: `DEPLOYMENT_STEP_BY_STEP.md`

