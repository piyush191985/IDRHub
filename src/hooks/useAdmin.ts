import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Property, Agent, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useAdmin = () => {
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [verifiedProperties, setVerifiedProperties] = useState<Property[]>([]);
  const [pendingAgents, setPendingAgents] = useState<Agent[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      console.log('🔄 Admin detected, fetching data...');
      fetchAllData();
    } else {
      console.log('❌ User is not admin or not logged in');
    }
  }, [user]);

  const fetchVerifiedProperties = async () => {
    try {
      console.log('🔄 Fetching verified properties...');
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          agent:users!properties_agent_id_fkey(*)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching verified properties:', error);
        throw error;
      }
      console.log('✅ Found verified properties:', data?.length);
      setVerifiedProperties(data || []);
    } catch (err) {
      console.error('❌ Error in fetchVerifiedProperties:', err);
    }
  };

  const fetchPendingProperties = async () => {
    try {
      console.log('🔄 Fetching pending properties...');
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          agent:users!properties_agent_id_fkey(*)
        `)
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching pending properties:', error);
        throw error;
      }
      console.log('✅ Found pending properties:', data?.length);
      setPendingProperties(data || []);
    } catch (err) {
      console.error('❌ Error in fetchPendingProperties:', err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      console.log('🔄 Fetching all users...');
      
      // Try with service role key first (if available)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching users:', error);
        console.log('🔍 This might be an RLS issue. Error details:', error);
        
        // If RLS is blocking, we'll get user data from the agents table instead
        console.log('🔄 Trying to get user data from agents table...');
        const { data: agentsData, error: agentsError } = await supabase
          .from('agents')
          .select('user_id')
          .order('created_at', { ascending: false });

        if (!agentsError && agentsData) {
          console.log('✅ Found agent user IDs:', agentsData.length);
          // For now, create placeholder users
          const placeholderUsers = agentsData.map((agent, index) => ({
            id: agent.user_id,
            email: `user${index + 1}@example.com`,
            full_name: `User ${index + 1}`,
            phone: '',
            role: 'agent' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          setAllUsers(placeholderUsers);
          return;
        }
        
        throw error;
      }
      
      console.log('✅ Found users:', data?.length);
      console.log('📋 All Users:', data?.map(u => ({ 
        id: u.id, 
        name: u.full_name, 
        email: u.email,
        role: u.role 
      })));
      
      // Check what roles exist
      const roles = [...new Set(data?.map(u => u.role) || [])];
      console.log('🔍 Available roles:', roles);
      
      setAllUsers(data || []);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setAllUsers([]);
    }
  };

  const fetchAllAgents = async () => {
    try {
      console.log('🔄 Fetching all agents...');
      
      // Get all agents from agents table with user data
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select(`
          *,
          user:users!agents_id_fkey(
            id,
            email,
            full_name,
            phone,
            role,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (agentsError) {
        console.error('❌ Error fetching agents:', agentsError);
        throw agentsError;
      }

      console.log('✅ Found agents in agents table:', agentsData?.length);
      
      if (!agentsData || agentsData.length === 0) {
        console.log('⚠️ No agents found in agents table');
        setAllAgents([]);
        return;
      }

      // Process agents data
      const agents: Agent[] = agentsData.map(agent => {
        const userData = agent.user || {
          id: agent.id,
          email: 'unknown@example.com',
          full_name: 'Unknown User',
          phone: '',
          role: 'agent' as const,
          created_at: agent.created_at,
          updated_at: agent.updated_at,
        };

        return {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role,
          created_at: userData.created_at,
          verified: agent.verified || false,
          rating: agent.rating || 0,
          total_sales: agent.total_sales || 0,
          experience_years: agent.experience_years || 0,
          specializations: agent.specializations || [],
          bio: agent.bio || '',
          license_number: agent.license_number || '',
          commission_rate: agent.commission_rate || 2.5,
        } as Agent;
      });

      console.log('✅ Processed agents:', agents.length);
      console.log('📋 Sample agent:', agents[0]);
      setAllAgents(agents);

    } catch (err) {
      console.error('❌ Error fetching all agents:', err);
      setAllAgents([]);
    }
  };

  const fetchPendingAgents = async () => {
    try {
      console.log('🔄 Fetching pending agents...');
      
      // Get unverified agents from agents table with user data
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select(`
          *,
          user:users!agents_id_fkey(
            id,
            email,
            full_name,
            phone,
            role,
            created_at,
            updated_at
          )
        `)
        .eq('verified', false)
        .order('created_at', { ascending: false });

      if (agentsError) {
        console.error('❌ Error fetching pending agents:', agentsError);
        throw agentsError;
      }

      console.log('✅ Found unverified agents:', agentsData?.length);
      
      if (!agentsData || agentsData.length === 0) {
        setPendingAgents([]);
        return;
      }

      // Process agents data
      const pendingAgents: Agent[] = agentsData.map(agent => {
        const userData = agent.user || {
          id: agent.id,
          email: 'unknown@example.com',
          full_name: 'Unknown Pending Agent',
          phone: '',
          role: 'agent' as const,
          created_at: agent.created_at,
          updated_at: agent.updated_at,
        };

        return {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role,
          created_at: userData.created_at,
          verified: agent.verified || false,
          rating: agent.rating || 0,
          total_sales: agent.total_sales || 0,
          experience_years: agent.experience_years || 0,
          specializations: agent.specializations || [],
          bio: agent.bio || '',
          license_number: agent.license_number || '',
          commission_rate: agent.commission_rate || 2.5,
        } as Agent;
      });

      console.log('✅ Processed pending agents:', pendingAgents.length);
      setPendingAgents(pendingAgents);

    } catch (err) {
      console.error('❌ Error fetching pending agents:', err);
      setPendingAgents([]);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchPendingProperties(),
        fetchVerifiedProperties(),
        fetchAllUsers(),
        fetchAllAgents(),
        fetchPendingAgents()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const approveProperty = async (propertyId: string) => {
    try {
      console.log('🔄 Approving property:', propertyId);
      console.log('🔍 Current user role:', user?.role);
      console.log('🔍 Current user ID:', user?.id);

      // First check the property before update
      const { data: propertyCheck, error: checkError } = await supabase
        .from('properties')
        .select('id, title, is_approved, agent_id')
        .eq('id', propertyId)
        .single();

      if (checkError) {
        console.error('❌ Error checking property:', checkError);
        throw checkError;
      }

      console.log('📋 Property to approve:', propertyCheck);
      
      // Now try to update the property
      const { data, error } = await supabase
        .from('properties')
        .update({ is_approved: true })
        .eq('id', propertyId)
        .select();

      if (error) {
        console.error('❌ Error approving property:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ Property approved successfully:', data);

      // Check if the update actually worked by fetching the property again
      const { data: verifyUpdate, error: verifyError } = await supabase
        .from('properties')
        .select('id, title, is_approved, agent_id')
        .eq('id', propertyId)
        .single();

      if (verifyError) {
        console.error('❌ Error verifying update:', verifyError);
      } else {
        console.log('🔍 Property after update:', verifyUpdate);
        
        if (verifyUpdate.is_approved) {
          console.log('✅ Property approval successful!');
          // Refresh the data
          fetchPendingProperties();
          fetchVerifiedProperties();
        } else {
          console.error('❌ Update failed - property is still not approved');
        }
      }

    } catch (err) {
      console.error('❌ Error approving property:', err);
      console.error('❌ Full error object:', err);
      throw err;
    }
  };

  const rejectProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        console.error('Error rejecting property:', error);
        throw error;
      }

      // Refresh the data
      fetchPendingProperties();
      fetchVerifiedProperties();
    } catch (err) {
      console.error('Error rejecting property:', err);
      throw err;
    }
  };

  const verifyAgent = async (agentId: string) => {
    try {
      console.log('🔄 Verifying agent:', agentId);
      
      // Update the agents table to set verified = true
      const { error } = await supabase
        .from('agents')
        .update({ verified: true })
        .eq('id', agentId);

      if (error) {
        console.error('❌ Error verifying agent:', error);
        throw error;
      }
      
      console.log('✅ Agent verified successfully');
      
      // Refresh the data
      await fetchAllAgents();
      await fetchPendingAgents();
    } catch (err) {
      console.error('❌ Error verifying agent:', err);
      throw err;
    }
  };

  const unverifyAgent = async (agentId: string) => {
    try {
      console.log('🔄 Unverifying agent:', agentId);
      
      // Update the agents table to set verified = false
      const { error } = await supabase
        .from('agents')
        .update({ verified: false })
        .eq('id', agentId);

      if (error) {
        console.error('❌ Error unverifying agent:', error);
        throw error;
      }
      
      console.log('✅ Agent unverified successfully');
      
      // Refresh the data
      await fetchAllAgents();
      await fetchPendingAgents();
    } catch (err) {
      console.error('❌ Error unverifying agent:', err);
      throw err;
    }
  };

  const deleteAgent = async (agentId: string) => {
    try {
      console.log('🔄 Deleting agent:', agentId);
      
      // Delete the agent from the agents table
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) {
        console.error('❌ Error deleting agent:', error);
        throw error;
      }
      
      console.log('✅ Agent deleted successfully');
      
      // Refresh the data
      await fetchAllAgents();
      await fetchPendingAgents();
    } catch (err) {
      console.error('❌ Error deleting agent:', err);
      throw err;
    }
  };

  // Test admin permissions when component mounts
  useEffect(() => {
    if (user?.role === 'admin') {
      console.log('🔐 Admin user detected, permissions should be active');
    }
  }, [user]);

  return {
    allAgents,
    pendingAgents,
    pendingProperties,
    verifiedProperties,
    loading,
    error,
    verifyAgent,
    unverifyAgent,
    deleteAgent,
    approveProperty,
    rejectProperty,
  };
};