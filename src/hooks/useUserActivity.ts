import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

export const useUserActivity = () => {
  const { user } = useAuth();
  const location = useLocation();

  const updateActivity = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_activity')
        .upsert({
          user_id: user.id,
          last_seen: new Date().toISOString(),
          is_online: true,
          current_page: location.pathname,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating user activity:', error);
        // If the table doesn't exist or has issues, don't spam the console
        if (error.code === '42P10' || error.code === '42P01') {
          console.warn('User activity tracking not available:', error.message);
          return;
        }
      }
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }, [user, location.pathname]);

  const markAsOffline = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_activity')
        .update({
          is_online: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error marking user as offline:', error);
    }
  }, [user]);

  // Update activity when user or location changes
  useEffect(() => {
    updateActivity();
  }, [updateActivity]);

  // Update activity every 30 seconds while user is active
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      updateActivity();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, updateActivity]);

  // Update activity when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity();
      } else {
        markAsOffline();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateActivity, markAsOffline]);

  // Update activity when user becomes active
  useEffect(() => {
    const handleUserActivity = () => {
      updateActivity();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [updateActivity]);

  // Mark user as offline when page is unloaded
  useEffect(() => {
    const handleBeforeUnload = () => {
      markAsOffline();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [markAsOffline]);

  // Periodic cleanup of inactive users (every 5 minutes)
  useEffect(() => {
    if (!user) return;

    const cleanupInterval = setInterval(async () => {
      try {
        await supabase.rpc('mark_users_offline');
      } catch (error) {
        console.error('Error during periodic cleanup:', error);
      }
    }, 300000); // 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [user]);

  return { updateActivity, markAsOffline };
}; 