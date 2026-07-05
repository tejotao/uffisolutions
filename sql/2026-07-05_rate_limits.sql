-- DIY rate limiting for unauthenticated API routes (no KV/Redis in this
-- project yet). Only ever touched by service-role backend code, so RLS
-- stays off — there is no anon-key access path to this table.
CREATE TABLE IF NOT EXISTS public.rate_limits (
  ip TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (ip, endpoint)
);
