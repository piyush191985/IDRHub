import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
    role: string;
  };
}

interface AuditLogFilters {
  action?: string;
  table_name?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const fetchAuditLogs = async (reset = false) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:users!audit_logs_user_id_fkey(
            full_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.action && filters.action !== 'all') {
        query = query.eq('action', filters.action.toUpperCase());
      }

      if (filters.table_name && filters.table_name !== 'all') {
        query = query.eq('table_name', filters.table_name);
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters.search) {
        query = query.or(`user.full_name.ilike.%${filters.search}%,action.ilike.%${filters.search}%,table_name.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const currentPage = reset ? 0 : page;
      query = query.range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);

      const { data, error } = await query;

      if (error) throw error;

      if (reset) {
        setAuditLogs(data || []);
        setPage(0);
      } else {
        setAuditLogs(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data || []).length === pageSize);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchAuditLogs();
    }
  };

  const refresh = () => {
    fetchAuditLogs(true);
  };

  useEffect(() => {
    fetchAuditLogs(true);
  }, [filters]);

  useEffect(() => {
    if (page > 0) {
      fetchAuditLogs();
    }
  }, [page]);

  return {
    auditLogs,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}; 