import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

export function useSuperAdminCheck() {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      if (!user?.email) {
        if (mounted) {
          setIsSuperAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('email', user.email)
          .eq('role', 'superadmin')
          .maybeSingle();

        if (error) {
          console.error('Error fetching admin roles:', error);
          if (mounted) setIsSuperAdmin(false);
        } else {
          if (mounted) setIsSuperAdmin(!!data);
        }
      } catch (err) {
        console.error('Unexpected error checking admin status:', err);
        if (mounted) setIsSuperAdmin(false);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  return { isSuperAdmin, loading };
}