-- Per-user "seen" state for library deliverables (PDFs/videos/audio/etc).
CREATE TABLE IF NOT EXISTS public.deliverable_views (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deliverable_id UUID NOT NULL REFERENCES public.product_deliverables(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, deliverable_id)
);

ALTER TABLE public.deliverable_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own deliverable views" ON public.deliverable_views;
CREATE POLICY "Users manage their own deliverable views" ON public.deliverable_views
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
