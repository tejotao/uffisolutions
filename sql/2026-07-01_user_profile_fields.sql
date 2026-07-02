-- Profile CRUD: adds the remaining fields for the self-service profile modal
-- (city rounds out the existing address_street/address_number/postal_code/
-- country set) and an admin-only `classification` field.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS contact_preference TEXT DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS classification TEXT;

-- Extends the existing self-privilege-escalation guard (from the user-block
-- feature) so `classification` is admin-only too — a user must not be able
-- to set their own classification via a direct PATCH to their own row.
CREATE OR REPLACE FUNCTION public.prevent_self_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() = OLD.id THEN
    IF NEW.status         IS DISTINCT FROM OLD.status
    OR NEW.role            IS DISTINCT FROM OLD.role
    OR NEW.is_admin        IS DISTINCT FROM OLD.is_admin
    OR NEW.classification  IS DISTINCT FROM OLD.classification
    OR NEW.blocked_at      IS DISTINCT FROM OLD.blocked_at
    OR NEW.blocked_reason  IS DISTINCT FROM OLD.blocked_reason
    OR NEW.blocked_by      IS DISTINCT FROM OLD.blocked_by
    THEN
      RAISE EXCEPTION 'Not allowed to modify protected fields on your own profile';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
