-- Lightweight support/feedback ticket log. The actual back-and-forth always
-- happens over email (no in-app chat/thread) — this table just gives every
-- request a stable ID + centralized record admins can review and mark
-- resolved, grouped by status.
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'support' CHECK (type IN ('support', 'feedback')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON public.support_tickets(status);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users create own tickets" ON public.support_tickets;
CREATE POLICY "Users create own tickets" ON public.support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own tickets" ON public.support_tickets;
CREATE POLICY "Users read own tickets" ON public.support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Reuses is_admin_or_super() from 2026-07-01_admin_update_profiles_rls.sql
DROP POLICY IF EXISTS "Admins read all tickets" ON public.support_tickets;
CREATE POLICY "Admins read all tickets" ON public.support_tickets
  FOR SELECT
  USING (public.is_admin_or_super());

DROP POLICY IF EXISTS "Admins update all tickets" ON public.support_tickets;
CREATE POLICY "Admins update all tickets" ON public.support_tickets
  FOR UPDATE
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());
