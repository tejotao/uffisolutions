-- category_translations is the table every public-facing read actually uses
-- to display a category's name (fetchAllCategories() in catalogQueries.js),
-- but it has 0 rows — so the site currently falls back to a capitalized
-- slug ("Ebooks-guides" instead of "E-Books & Guides"). The real names
-- already exist on categories.name/name_pt/name_it/name_es (populated,
-- confirmed via REST), just never copied over. This unpivots those 4
-- columns into 4 rows per active category, rather than hardcoding the
-- values here — also means any future category filled in the same way
-- gets picked up by re-running this.
INSERT INTO public.category_translations (category_id, language, name, description)
SELECT id, 'en', name, COALESCE(description, '') FROM public.categories WHERE active = true AND name IS NOT NULL
UNION ALL
SELECT id, 'pt', name_pt, COALESCE(description, '') FROM public.categories WHERE active = true AND name_pt IS NOT NULL
UNION ALL
SELECT id, 'it', name_it, COALESCE(description, '') FROM public.categories WHERE active = true AND name_it IS NOT NULL
UNION ALL
SELECT id, 'es', name_es, COALESCE(description, '') FROM public.categories WHERE active = true AND name_es IS NOT NULL
ON CONFLICT (category_id, language) DO UPDATE SET name = EXCLUDED.name;
