-- Anonymous log of homepage search terms that matched zero products —
-- signal for what people are looking for that we don't sell yet.
-- No user_id/email collected on purpose (discreet, anonymous by design).
CREATE TABLE IF NOT EXISTS public.search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  language TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

-- Anyone (including logged-out visitors) can write a search term.
DROP POLICY IF EXISTS "Anyone can log a search" ON public.search_logs;
CREATE POLICY "Anyone can log a search" ON public.search_logs
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read them back (reuses the function from the
-- 2026-07-01_admin_update_profiles_rls.sql migration).
DROP POLICY IF EXISTS "Admins can read search logs" ON public.search_logs;
CREATE POLICY "Admins can read search logs" ON public.search_logs
  FOR SELECT
  USING (public.is_admin_or_super());
