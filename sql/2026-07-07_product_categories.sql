-- Many-to-many product <-> category relationship. products.category_id stays
-- as the "primary" category (still written on every save) for existing
-- single-category consumers (ProductDetail badge, admin table column, etc.)
-- untouched — this table adds the ability for a product to also surface
-- under a couple of additional categories (e.g. "Personal Shopper" under
-- Business + Services + Extra Income) for the Home page category filter.
CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON public.product_categories(category_id);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Public catalog browsing (Home page is shown to anonymous visitors) needs to
-- read this, same as products/categories themselves.
DROP POLICY IF EXISTS "Anyone can read product categories" ON public.product_categories;
CREATE POLICY "Anyone can read product categories" ON public.product_categories
  FOR SELECT
  USING (true);

-- Reuses is_admin_or_super() from 2026-07-01_admin_update_profiles_rls.sql
DROP POLICY IF EXISTS "Admins manage product categories" ON public.product_categories;
CREATE POLICY "Admins manage product categories" ON public.product_categories
  FOR ALL
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- Backfill: every existing product keeps its current single category as a row here.
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id FROM public.products
WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;
