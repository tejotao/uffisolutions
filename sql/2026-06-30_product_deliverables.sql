-- ════════════════════════════════════════════════════════════════════════
-- Product Deliverables — multiple delivery links per product, per type
-- Run this in Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE / DROP IF EXISTS guards).
-- ════════════════════════════════════════════════════════════════════════

-- 1. Table ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_deliverables (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('pdf','video','external','drive','other')),
  label       TEXT,                 -- optional friendly name, e.g. "Module 1 - Intro PDF"
  url         TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_deliverables_product_id
  ON public.product_deliverables(product_id);

-- 2. updated_at trigger ------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_product_deliverables_updated_at ON public.product_deliverables;
CREATE TRIGGER trg_product_deliverables_updated_at
BEFORE UPDATE ON public.product_deliverables
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Row Level Security -------------------------------------------------------
ALTER TABLE public.product_deliverables ENABLE ROW LEVEL SECURITY;

-- Admins (is_admin = true OR role in admin/super_admin) can fully manage rows.
DROP POLICY IF EXISTS "Admins manage deliverables" ON public.product_deliverables;
CREATE POLICY "Admins manage deliverables" ON public.product_deliverables
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role IN ('admin','super_admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role IN ('admin','super_admin'))
    )
  );

-- Any authenticated user can read deliverables (the dashboard already gates
-- which products a user can see via purchases / user_product_access).
DROP POLICY IF EXISTS "Authenticated read deliverables" ON public.product_deliverables;
CREATE POLICY "Authenticated read deliverables" ON public.product_deliverables
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. One-time migration of legacy single-link data ---------------------------
-- Copies products.access_url → a deliverable row (keeps existing product_type).
INSERT INTO public.product_deliverables (product_id, type, label, url, sort_order)
SELECT id, COALESCE(NULLIF(product_type, ''), 'other'), NULL, access_url, 0
FROM public.products
WHERE access_url IS NOT NULL AND access_url <> '';

-- Copies products.drive_link → a "Backup: Google Drive" deliverable row.
INSERT INTO public.product_deliverables (product_id, type, label, url, sort_order)
SELECT id, 'drive', 'Backup: Google Drive', drive_link, 1
FROM public.products
WHERE drive_link IS NOT NULL AND drive_link <> '';

-- Note: products.product_type / access_url / drive_link columns are left in
-- place (not dropped) for backward compatibility — they are simply no longer
-- written to by the app going forward. product_deliverables is now the
-- single source of truth for content delivery.
