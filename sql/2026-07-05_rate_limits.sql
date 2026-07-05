-- DIY rate limiting for unauthenticated API routes (no KV/Redis in this
-- project yet). Only ever touched by service-role backend code (which
-- bypasses RLS regardless), but Supabase exposes every public-schema table
-- over its REST API by default — without RLS, the public anon key (shipped
-- in the client bundle) could read or reset these counters directly. RLS is
-- enabled with zero policies on purpose: default-deny for anon/authenticated,
-- service role still works exactly as before.
CREATE TABLE IF NOT EXISTS public.rate_limits (
  ip TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (ip, endpoint)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
