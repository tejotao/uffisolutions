-- Fixes: admins/super_admins could not UPDATE another user's profiles row
-- (RLS silently no-op'd — 200 OK, 0 rows affected). This is what the
-- Block/Unblock feature in Admin > Users needs to actually persist.
--
-- SECURITY DEFINER avoids recursive-RLS issues: the function reads
-- public.profiles to check the caller's own role, bypassing RLS for that
-- one lookup, without granting the caller broader access.
CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role IN ('admin', 'super_admin') OR is_admin = true)
  );
$$;

-- Additive policy — does not replace/drop the existing "update own profile"
-- policy. Postgres RLS OR's all permissive policies for the same command.
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());
