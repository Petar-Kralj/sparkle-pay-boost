import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSubscription = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsActive(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      const [{ data: sub }, { data: role }] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle(),
      ]);

      setIsActive(!!sub || !!role);
      setLoading(false);
    };

    check();
  }, [user]);

  return { isActive, loading };
};
