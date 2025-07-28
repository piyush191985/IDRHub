import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Agent } from '../types';

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching agents with user data and reviews...');
      
      // Fetch agents with user data using JOIN
      const { data: agentsWithUsers, error: agentsError } = await supabase
        .from('agents')
        .select(`
          *,
          user:users!agents_id_fkey(
            id,
            full_name,
            email,
            role,
            avatar_url,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (agentsError) {
        console.error('❌ Error fetching agents with users:', agentsError);
        throw agentsError;
      }

      console.log('✅ Found agents with user data:', agentsWithUsers?.length);
      
      // Fetch reviews for all agents
      const { data: allReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:users!reviews_reviewer_id_fkey(full_name),
          property:properties(title)
        `)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('❌ Error fetching reviews:', reviewsError);
        // Continue without reviews if there's an error
      }

      console.log('✅ Found reviews:', allReviews?.length);
      
      // Transform agents with user data and reviews
      const transformedAgents = agentsWithUsers?.map(agentWithUser => {
        const user = agentWithUser.user;
        
        // Get reviews for this agent
        const agentReviews = allReviews?.filter(review => review.agent_id === agentWithUser.id) || [];
        
        // Calculate average rating from reviews
        const avgRating =
          agentReviews.length > 0
            ? agentReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / agentReviews.length
            : 0;
        // Get the latest review for preview
        const latestReview = agentReviews.length > 0 ? agentReviews[0] : null;
        
        return {
          id: agentWithUser.id,
          full_name: user?.full_name || `Agent ${agentWithUser.id.slice(0, 8)}`,
          email: user?.email || `agent-${agentWithUser.id.slice(0, 8)}@example.com`,
          role: user?.role || 'agent',
          avatar_url: user?.avatar_url || null,
          phone: user?.phone || null,
          verified: agentWithUser.verified || false,
          rating: avgRating, // Use calculated average rating
          total_sales: agentWithUser.total_sales || 0,
          experience_years: agentWithUser.experience_years || 0,
          specializations: agentWithUser.specializations || [],
          bio: agentWithUser.bio || '',
          license_number: agentWithUser.license_number || '',
          commission_rate: agentWithUser.commission_rate || 2.5,
          reviews: agentReviews,
          review_count: agentReviews.length,
          latest_review: latestReview,
        } as Agent;
      }) || [];

      console.log('✅ Transformed agents with user data and reviews:', transformedAgents.length);
      console.log('📋 Sample agent data:', transformedAgents[0]);
      
      setAgents(transformedAgents);
    } catch (err) {
      console.error('❌ Error fetching agents:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    agents,
    loading,
    error,
    fetchAgents,
  };
};