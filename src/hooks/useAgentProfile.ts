import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useAgentProfile = () => {
  const { user } = useAuth();
  const [agentData, setAgentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'agent') {
      fetchAgentProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAgentProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      setAgentData(data);
    } catch (err) {
      console.error('Error fetching agent profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch agent profile');
    } finally {
      setLoading(false);
    }
  };

  const updateAgentProfile = async (profileData: any) => {
    try {
      const { error } = await supabase
        .from('agents')
        .upsert({
          id: user?.id,
          ...profileData,
        });

      if (error) throw error;
      
      await fetchAgentProfile();
      return { success: true };
    } catch (err) {
      console.error('Error updating agent profile:', err);
      return { success: false, error: err };
    }
  };

  return {
    agentData,
    loading,
    error,
    updateAgentProfile,
    fetchAgentProfile,
  };
}; 