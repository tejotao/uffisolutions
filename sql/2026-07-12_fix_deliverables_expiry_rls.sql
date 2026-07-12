-- The RLS policy "product_deliverables_select_purchased" (added in a prior
-- session directly via the SQL Editor, no migration file committed for it)
-- already fixed the original hole where ANY authenticated user could read
-- ANY product's deliverable links. But its EXISTS check only confirms a
-- user_product_access ROW exists for (user_id, product_id) — it does not
-- check that access is still active or unexpired:
--
--   EXISTS (SELECT 1 FROM user_product_access upa
--           WHERE upa.product_id = product_deliverables.product_id
--             AND upa.user_id = auth.uid())
--
-- revokeProductAccess() (src/lib/accessQueries.js) hard-deletes the row, so
-- revocation is already safe. But expiry is NOT a delete — an expired grant
-- keeps its row with expiry_date in the past. The app's own UI correctly
-- hides expired access (see getMyActiveAccesses(), which filters on
-- is_active = true AND (expiry_date IS NULL OR expiry_date >= today)), but
-- the RLS layer didn't enforce the same rule — an expired user could still
-- read deliverable URLs directly via the API forever. This migration makes
-- the policy match the app's own definition of "active access" exactly.

DROP POLICY IF EXISTS "product_deliverables_select_purchased" ON public.product_deliverables;

CREATE POLICY "product_deliverables_select_purchased" ON public.product_deliverables
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.user_product_access upa
      WHERE upa.product_id = product_deliverables.product_id
        AND upa.user_id = auth.uid()
        AND upa.is_active = true
        AND (upa.expiry_date IS NULL OR upa.expiry_date >= CURRENT_DATE)
    )
  );
