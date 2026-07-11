-- Adds the fields needed to render a full landing page per product
-- (/products/:slug) instead of just the current title/description/price
-- card. Every column is nullable / optional — the public page adapts its
-- layout to whatever the admin has filled in and hides empty sections.
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS hero_description TEXT,
ADD COLUMN IF NOT EXISTS what_you_learn JSONB,
ADD COLUMN IF NOT EXISTS sections JSONB,
ADD COLUMN IF NOT EXISTS includes JSONB,
ADD COLUMN IF NOT EXISTS guarantee_days INTEGER DEFAULT 14,
ADD COLUMN IF NOT EXISTS guarantee_text TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS faq JSONB,
ADD COLUMN IF NOT EXISTS badge_text TEXT,
ADD COLUMN IF NOT EXISTS testimonials JSONB;

-- Shape reference (all arrays default to NULL / empty, not enforced by a
-- CHECK constraint — kept flexible since this is admin-authored content):
--   what_you_learn: ["Bullet one", "Bullet two", ...]
--   includes:       ["PDF 45 pages", "Excel spreadsheet", "Lifetime access"]
--   sections:       [{ "title": "...", "icon": "🚀", "description": "...", "bullets": ["...", "..."] }, ...]
--   faq:            [{ "question": "...", "answer": "..." }, ...]
--   testimonials:   [{ "name": "...", "text": "...", "rating": 5 }, ...]
