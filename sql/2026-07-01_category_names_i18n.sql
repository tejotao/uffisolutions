-- The categories table had no `name` or `description` columns at all
-- (confirmed via REST: "column categories.name does not exist") — the modal
-- in AdminCategories.jsx was already failing to save before this change.
-- Display elsewhere in the app reads names from `category_translations`
-- (untouched by this migration); these flat columns are for the admin
-- modal only, per the current task's scope.
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS name_pt TEXT,
  ADD COLUMN IF NOT EXISTS name_it TEXT,
  ADD COLUMN IF NOT EXISTS name_es TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT;
