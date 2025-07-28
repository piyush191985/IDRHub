import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

interface CreateRoleData {
  name: string;
  description: string;
  permissions: string[];
}

interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
}

export const useCustomRoles = () => {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoles(data || []);
    } catch (err) {
      console.error('Error fetching custom roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch custom roles');
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: CreateRoleData): Promise<CustomRole | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .insert([roleData])
        .select()
        .single();

      if (error) throw error;

      setRoles(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating custom role:', err);
      setError(err instanceof Error ? err.message : 'Failed to create custom role');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id: string, roleData: UpdateRoleData): Promise<CustomRole | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .update({
          ...roleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setRoles(prev => prev.map(role => role.id === id ? data : role));
      return data;
    } catch (err) {
      console.error('Error updating custom role:', err);
      setError(err instanceof Error ? err.message : 'Failed to update custom role');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('custom_roles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRoles(prev => prev.filter(role => role.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting custom role:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete custom role');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getRoleById = (id: string): CustomRole | undefined => {
    return roles.find(role => role.id === id);
  };

  const getRoleByName = (name: string): CustomRole | undefined => {
    return roles.find(role => role.name === name);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    getRoleByName,
    refresh: fetchRoles
  };
}; 