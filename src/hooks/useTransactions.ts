import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useTransactions(filters?: any) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      let query = supabase.from('transactions').select('*');
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setTransactions(data || []);
      setLoading(false);
    };
    fetchTransactions();
  }, [filters]);

  return { transactions, loading, error };
}

export async function fetchTransactionById(id: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, property:property_id(name), agent:agent_id(full_name), buyer:buyer_id(full_name), seller:seller_id(full_name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createTransaction(payload: any) {
  const { data, error } = await supabase.from('transactions').insert([payload]).single();
  if (error) throw error;
  return data;
}

export async function updateTransaction(id: string, updates: any) {
  const { data, error } = await supabase.from('transactions').update(updates).eq('id', id).single();
  if (error) throw error;
  return data;
} 