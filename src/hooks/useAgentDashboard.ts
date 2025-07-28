import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Property, Inquiry, Favorite } from '../types';

interface AgentStats {
  totalProperties: number;
  totalLikes: number;
  totalInquiries: number;
  avgRating: number;
  totalViews: number;
}

interface AgentReview {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface AgentProperty extends Property {
  likes_count: number;
  inquiries_count: number;
  views_count: number;
}

export const useAgentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AgentStats>({
    totalProperties: 0,
    totalLikes: 0,
    totalInquiries: 0,
    avgRating: 0,
    totalViews: 0,
  });
  const [properties, setProperties] = useState<AgentProperty[]>([]);
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role === 'agent') {
      fetchAgentData();
    }
  }, [user]);

  const fetchAgentData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch agent's properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          *,
          agent:users!properties_agent_id_fkey(*)
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Fetch likes for agent's properties
      const { data: likesData, error: likesError } = await supabase
        .from('favorites')
        .select('property_id')
        .in('property_id', propertiesData?.map(p => p.id) || []);

      if (likesError) throw likesError;

      // Fetch inquiries for agent's properties
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('property_id')
        .in('property_id', propertiesData?.map(p => p.id) || []);

      if (inquiriesError) throw inquiriesError;

      // Calculate stats
      const totalProperties = propertiesData?.length || 0;
      const totalLikes = likesData?.length || 0;
      const totalInquiries = inquiriesData?.length || 0;
      const totalViews = propertiesData?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;

      // Fetch agent reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:users!reviews_reviewer_id_fkey(full_name)
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Calculate average rating
      const avgRating = reviewsData && reviewsData.length > 0 
        ? Number((reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length).toFixed(1))
        : 0;

      setStats({
        totalProperties,
        totalLikes,
        totalInquiries,
        avgRating,
        totalViews,
      });

      // Enhance properties with counts
      const enhancedProperties = propertiesData?.map(property => {
        const propertyLikes = likesData?.filter(like => like.property_id === property.id).length || 0;
        const propertyInquiries = inquiriesData?.filter(inquiry => inquiry.property_id === property.id).length || 0;
        
        return {
          ...property,
          likes_count: propertyLikes,
          inquiries_count: propertyInquiries,
          views_count: property.view_count || 0,
        };
      }) || [];

      setProperties(enhancedProperties);

      // Set real reviews
      const transformedReviews = reviewsData?.map(review => ({
        id: review.id,
        reviewer_name: review.reviewer?.full_name || 'Anonymous',
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      })) || [];

      setReviews(transformedReviews);

    } catch (err) {
      console.error('Error fetching agent data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProperty = async (propertyId: string, updates: Partial<Property>) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', propertyId)
        .eq('agent_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setProperties(prev =>
        prev.map(property => (property.id === propertyId ? { ...property, ...data } : property))
      );

      return data;
    } catch (err) {
      console.error('Error updating property:', err);
      throw err;
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('agent_id', user?.id);

      if (error) throw error;

      setProperties(prev => prev.filter(property => property.id !== propertyId));
      await fetchAgentData(); // Refresh stats
    } catch (err) {
      console.error('Error deleting property:', err);
      throw err;
    }
  };

  return {
    stats,
    properties,
    reviews,
    loading,
    error,
    updateProperty,
    deleteProperty,
    refreshData: fetchAgentData,
  };
}; 