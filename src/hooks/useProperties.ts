import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Property, SearchCriteria } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useProperties = (criteria?: SearchCriteria, showAll: boolean = false) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchProperties();
    subscribeToProperties();
  }, [criteria, showAll, user]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('properties')
        .select(`
          *,
          agent:users!properties_agent_id_fkey(*)
        `);

      // Apply filters based on user role
      if (user?.role === 'admin') {
        // Admin can see all properties
      } else if (user?.role === 'agent') {
        // Agents can see approved properties and their own unapproved ones, but not booked/sold
        query = query.or(`is_approved.eq.true,agent_id.eq.${user.id}`)
          .not('status', 'in', '(booked,sold)');
      } else {
        // Regular users can only see approved and available properties
        query = query.eq('is_approved', true)
          .not('status', 'in', '(booked,sold)');
      }

      // Apply search criteria
      if (criteria) {
        if (criteria.location) {
          query = query.or(
            `city.ilike.%${criteria.location}%,state.ilike.%${criteria.location}%,address.ilike.%${criteria.location}%`
          );
        }
        if (criteria.min_price) {
          query = query.gte('price', criteria.min_price);
        }
        if (criteria.max_price) {
          query = query.lte('price', criteria.max_price);
        }
        if (criteria.bedrooms) {
          query = query.gte('bedrooms', criteria.bedrooms);
        }
        if (criteria.bathrooms) {
          query = query.gte('bathrooms', criteria.bathrooms);
        }
        if (criteria.property_type) {
          query = query.eq('property_type', criteria.property_type);
        }
        if (criteria.min_sqft) {
          query = query.gte('square_feet', criteria.min_sqft);
        }
        if (criteria.max_sqft) {
          query = query.lte('square_feet', criteria.max_sqft);
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Properties fetch error:', error);
        throw error;
      }

      // Fetch likes count for each property
      if (data && data.length > 0) {
        const propertyIds = data.map(p => p.id);
        const { data: likesData, error: likesError } = await supabase
          .from('favorites')
          .select('property_id')
          .in('property_id', propertyIds);

        if (!likesError && likesData) {
          // Count likes for each property
          const likesCount = likesData.reduce((acc, like) => {
            acc[like.property_id] = (acc[like.property_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          // Add likes_count to each property
          const enhancedData = data.map(property => ({
            ...property,
            likes_count: likesCount[property.id] || 0,
          }));

          setProperties(enhancedData);
        } else {
          setProperties(data);
        }
      } else {
        setProperties(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async (property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([property])
        .select(`
          *,
          agent:users!properties_agent_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      setProperties(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          agent:users!properties_agent_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      setProperties(prev =>
        prev.map(property => (property.id === id ? data : property))
      );
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProperties(prev => prev.filter(property => property.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const incrementViewCount = async (id: string) => {
    try {
      // Use the combined function that handles both view count increment and detailed tracking
      const { error } = await supabase
        .rpc('record_property_view_with_count', { property_id: id });

      if (error) {
        console.error('Error recording property view:', error);
      }
    } catch (err) {
      console.error('Error recording property view:', err);
    }
  };

  const subscribeToProperties = () => {
    if (!user) return;

    const subscription = supabase
      .channel('properties')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties',
        },
        () => {
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  return {
    properties,
    loading,
    error,
    fetchProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    incrementViewCount,
  };
};