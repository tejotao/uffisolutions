-- In-app notifications. UI (NotificationBell/NotificationDropdown/NotificationItem)
-- and query layer (src/lib/notificationQueries.js) already existed but had no
-- table and were never mounted — this is the missing piece.
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  icon TEXT,
  action_url TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own notifications" ON public.notifications;
CREATE POLICY "Users read their own notifications" ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update their own notifications" ON public.notifications;
CREATE POLICY "Users update their own notifications" ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete their own notifications" ON public.notifications;
CREATE POLICY "Users delete their own notifications" ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- No public INSERT policy: notifications are only ever written by the
-- webhook (service role, bypasses RLS) or admin actions — never by a user
-- writing a notification for themselves or someone else.
