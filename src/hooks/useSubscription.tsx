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

    const checkSubscription = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      setIsActive(!!data);
      setLoading(false);
    };

    checkSubscription();
  }, [user]);

  return { isActive, loading };
};
