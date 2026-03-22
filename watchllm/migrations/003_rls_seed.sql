-- Better Auth default SQLite/D1 tables (model names: user, session, account, verification)

CREATE TABLE IF NOT EXISTS "user" (
  "id" text NOT NULL PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" integer NOT NULL DEFAULT 0,
  "image" text,
  "createdAt" integer NOT NULL,
  "updatedAt" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text NOT NULL PRIMARY KEY,
  "expiresAt" integer NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" integer NOT NULL,
  "updatedAt" integer NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_userId ON "session"("userId");

CREATE TABLE IF NOT EXISTS "account" (
  "id" text NOT NULL PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" integer,
  "refreshTokenExpiresAt" integer,
  "scope" text,
  "password" text,
  "createdAt" integer NOT NULL,
  "updatedAt" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_account_userId ON "account"("userId");

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text NOT NULL PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" integer NOT NULL,
  "createdAt" integer NOT NULL,
  "updatedAt" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"("identifier");

INSERT OR IGNORE INTO users (id, email, github_username, tier, created_at, stripe_customer_id)
VALUES (
  'usr_localdev',
  'dev@watchllm.dev',
  NULL,
  'pro',
  strftime('%s', 'now'),
  NULL
);
