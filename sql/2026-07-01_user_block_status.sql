-- Soft-block for user accounts, replacing hard-delete as the default moderation
-- action. Preserves purchases/access history for audit trail + LGPD
-- accountability (Art. 6, VI) instead of deleting the profile row.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
  ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES public.profiles(id);

-- Defense in depth: blocks any request (including a blocked user's own valid
-- session) from changing role/status/is_admin/blocked_* fields on their own
-- row, regardless of how the existing RLS policies on this table are
-- configured. Other self-service fields (name, avatar, preferred_language...)
-- are untouched by this trigger.
CREATE OR REPLACE FUNCTION public.prevent_self_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() = OLD.id THEN
    IF NEW.status         IS DISTINCT FROM OLD.status
    OR NEW.role            IS DISTINCT FROM OLD.role
    OR NEW.is_admin        IS DISTINCT FROM OLD.is_admin
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

DROP TRIGGER IF EXISTS trg_prevent_self_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_self_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_privilege_escalation();
