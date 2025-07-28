import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Booking {
  id: string;
  property_id: string;
  agent_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  message?: string;
  status: string;
  token_amount?: number;
  transaction_id?: string | null;
  created_at: string;
  property?: any;
}

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('bookings')
        .select(`*, property:properties(*, agent:users!properties_agent_id_fkey(*))`)
        .order('created_at', { ascending: false });

      if (user.role === 'agent') {
        query = query.eq('agent_id', user.id);
      }
      // Admins see all bookings

      const { data, error } = await query;
      if (error) throw error;
      setBookings(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  return { bookings, loading, error, fetchBookings };
}; 