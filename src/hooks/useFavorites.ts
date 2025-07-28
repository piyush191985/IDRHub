import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { user } = useAuth();

  // Memoize the user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id]);

  // Debounced fetch function
  const fetchFavorites = useCallback(async () => {
    if (!userId) return;

    // Prevent fetching if we've fetched in the last 2 seconds
    const now = Date.now();
    if (now - lastFetch < 2000) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLastFetch(now);
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          property:properties(
            *,
            agent:users!properties_agent_id_fkey(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Favorites fetch error:', error);
        throw error;
      }

      const favoriteProperties = data?.map(fav => fav.property).filter(Boolean) || [];
      setFavorites(favoriteProperties);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId, lastFetch]);

  // Only fetch when user changes
  useEffect(() => {
    if (userId) {
      fetchFavorites();
      subscribeToFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [userId, fetchFavorites]);

  const addToFavorites = useCallback(async (propertyId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([
          {
            user_id: userId,
            property_id: propertyId,
          },
        ]);

      if (error) throw error;

      // Optimistically update the state
      setFavorites(prev => {
        // Don't refetch immediately, let the subscription handle it
        return prev;
      });
    } catch (err) {
      console.error('Error adding to favorites:', err);
      throw err;
    }
  }, [userId]);

  const removeFromFavorites = useCallback(async (propertyId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId);

      if (error) throw error;

      // Optimistically update the state
      setFavorites(prev => prev.filter(property => property.id !== propertyId));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      throw err;
    }
  }, [userId]);

  const isFavorite = useCallback((propertyId: string) => {
    return favorites.some(property => property.id === propertyId);
  }, [favorites]);

  const subscribeToFavorites = useCallback(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('favorites')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Debounce the subscription callback
          setTimeout(() => {
            fetchFavorites();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    fetchFavorites,
  };
};