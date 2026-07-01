-- ═══════════════════════════════════════════════════════════════════════════
-- product_deliverables — add provider, duration; extend type to include audio
-- Safe to re-run (IF NOT EXISTS / DROP+ADD CONSTRAINT).
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Add provider column (youtube | spotify | vimeo | supabase | drive | external | null)
ALTER TABLE public.product_deliverables
  ADD COLUMN IF NOT EXISTS provider TEXT;

-- 2. Add duration in seconds (optional, for display only)
ALTER TABLE public.product_deliverables
  ADD COLUMN IF NOT EXISTS duration INTEGER;

-- 3. Extend type CHECK to include 'audio'
--    (PostgreSQL requires drop + re-add for CHECK constraints)
ALTER TABLE public.product_deliverables
  DROP CONSTRAINT IF EXISTS product_deliverables_type_check;

ALTER TABLE public.product_deliverables
  ADD CONSTRAINT product_deliverables_type_check
  CHECK (type IN ('pdf', 'video', 'audio', 'external', 'drive', 'other'));

-- 4. Index on provider for future queries
CREATE INDEX IF NOT EXISTS idx_product_deliverables_provider
  ON public.product_deliverables(provider)
  WHERE provider IS NOT NULL;
