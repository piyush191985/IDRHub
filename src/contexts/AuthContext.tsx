import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, Agent } from '../types';

interface AuthContextType {
user: User | null;
supabaseUser: SupabaseUser | null;
loading: boolean;
signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
signIn: (email: string, password: string) => Promise<void>;
signOut: () => Promise<void>;
updateProfile: (updates: Partial<User>) => Promise<void>;
resetPassword: (email: string) => Promise<void>;
fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
const context = useContext(AuthContext);
if (!context) {
throw new Error('useAuth must be used within an AuthProvider');
}
return context;
};

// Cache keys for localStorage
const USER_CACHE_KEY = 'idrhub_user_cache';
const CACHE_EXPIRY_KEY = 'idrhub_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const [user, setUser] = useState<User | null>(null);
const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
const [loading, setLoading] = useState(true);

// Cache management functions
const getCachedUser = (): User | null => {
try {
const cached = localStorage.getItem(USER_CACHE_KEY);
const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

if (cached && expiry && Date.now() < parseInt(expiry)) {
return JSON.parse(cached);
}
} catch (error) {
console.warn('⚠️ Error reading cached user:', error);
}
return null;
};

const setCachedUser = (userData: User | null) => {
try {
if (userData) {
localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
} else {
localStorage.removeItem(USER_CACHE_KEY);
localStorage.removeItem(CACHE_EXPIRY_KEY);
}
} catch (error) {
console.warn('⚠️ Error caching user:', error);
}
};

// Set up session management
useEffect(() => {
  let mounted = true;

  // Get initial session
  const getSession = async () => {
    try {
      // First, try to get cached user data
      const cachedUser = getCachedUser();
      const { data: { session }, error } = await supabase.auth.getSession();

      // Use cached data if available for faster loading
      if (cachedUser && mounted) {
        setUser(cachedUser);
        setLoading(false);
        // Fetch fresh data in background if we have a session
        if (session?.user) {
          fetchUserProfile(session.user, true);
        }
        return;
      }

      if (error) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      if (session?.user && mounted) {
        setSupabaseUser(session.user);
        // No aggressive session refresh here
        if (cachedUser && cachedUser.id === session.user.id) {
          setUser(cachedUser);
          setLoading(false);
          fetchUserProfile(session.user, true);
        } else {
          await fetchUserProfile(session.user);
        }
      } else {
        if (mounted) {
          setLoading(false);
        }
      }
    } catch (error) {
      const cachedUser = getCachedUser();
      if (cachedUser && mounted) {
        setUser(cachedUser);
      }
      if (mounted) {
        setLoading(false);
      }
    }
  };

  getSession();

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && mounted) {
        setSupabaseUser(session.user);
        // No aggressive session refresh here
        const cachedUser = getCachedUser();
        if (cachedUser && cachedUser.id === session.user.id) {
          setUser(cachedUser);
          setLoading(false);
          fetchUserProfile(session.user, true);
        } else {
          await fetchUserProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT' && mounted) {
        setSupabaseUser(null);
        setUser(null);
        setCachedUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user && mounted) {
        setSupabaseUser(session.user);
        // No aggressive session refresh here
        if (!user) {
          const cachedUser = getCachedUser();
          if (cachedUser && cachedUser.id === session.user.id) {
            setUser(cachedUser);
            setLoading(false);
          } else {
            await fetchUserProfile(session.user);
          }
        } else {
          setLoading(false);
        }
      } else if (event === 'INITIAL_SESSION' && mounted) {
        if (!user && !supabaseUser) {
          setLoading(false);
        }
      }
    }
  );

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

const fetchUserProfile = async (authUser?: SupabaseUser, isBackground = false) => {
const userToFetch = authUser || supabaseUser;

if (!userToFetch) {
if (!isBackground) setLoading(false);
return;
}

try {
const maxRetries = 2; // Reduced from 3
const timeoutMs = 5000; // Reduced from 10 seconds to 5 seconds
let lastError: any = null;

for (let attempt = 1; attempt <= maxRetries; attempt++) {
try {
const timeoutPromise = new Promise((_, reject) => {
setTimeout(() => reject(new Error(`Profile fetch timeout (attempt ${attempt})`)), timeoutMs);
});

const fetchPromise = supabase
.from('users')
.select(`
id,
email,
full_name,
avatar_url,
phone,
role,
created_at,
updated_at
`)
.eq('id', userToFetch.id)
.single();

const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

if (error) {
if (error.message.includes('Profile fetch timeout')) {
lastError = error;

// If this is the last attempt, throw the error
if (attempt === maxRetries) {
throw error;
}

// Reduced wait time (500ms instead of 1000ms * attempt)
await new Promise(resolve => setTimeout(resolve, 500));
continue;
}

if (error.code === 'PGRST116') {
// Don't retry for this error
if (!isBackground) {
setUser(null);
setLoading(false);
}
return;
}

// For other errors, throw immediately
throw error;
}

if (data) {
// Transform database response to match User interface
const userData: User = {
id: data.id,
email: data.email,
full_name: data.full_name || 'Unknown User',
avatar_url: data.avatar_url || undefined,
phone: data.phone || undefined,
role: data.role as 'buyer' | 'agent' | 'admin',
created_at: data.created_at,
updated_at: data.updated_at,
};

setUser(userData);
setCachedUser(userData); // Cache the fresh data
return; // Success, exit the retry loop
} else {
if (!isBackground) {
setUser(null);
}
return;
}

} catch (attemptError) {
lastError = attemptError;

// If this is the last attempt, throw the error
if (attempt === maxRetries) {
throw attemptError;
}

// Reduced wait time
await new Promise(resolve => setTimeout(resolve, 500));
}
}

} catch (err) {
// If we have cached data and this is a background fetch, keep the cached data
if (isBackground) {
const cachedUser = getCachedUser();
if (cachedUser && cachedUser.id === userToFetch.id) {
return;
}
}

// For non-background fetches or when no cache exists, clear the user
if (!isBackground) {
setUser(null);
}

// Don't throw the error, just log it and continue
console.warn('⚠️ Profile fetch failed, but continuing with app...');
} finally {
if (!isBackground) {
setLoading(false);
}
}
};

const signUp = async (email: string, password: string, userData: Partial<User>) => {
try {
setLoading(true);

// First, sign up the user
const { data, error } = await supabase.auth.signUp({
email,
password,
options: {
emailRedirectTo: undefined,
},
});

if (error) {
throw error;
}

if (!data.user) {
throw new Error('User object is missing from signUp response.');
}

const userId = data.user.id;
const userEmail = data.user.email!;

// Wait a bit for the auth user to be fully created
await new Promise(resolve => setTimeout(resolve, 1000));

// Create user profile
const { error: profileError } = await supabase
.from('users')
.insert([
{
id: userId,
email: userEmail,
full_name: userData.full_name || null,
phone: userData.phone || null,
role: userData.role || 'buyer',
},
]);

if (profileError) {
throw profileError;
}

// Create agent profile if needed
if (userData.role === 'agent') {
const { error: agentError } = await supabase
.from('agents')
.insert([
{
id: userId,
verified: false,
rating: 0,
total_sales: 0,
experience_years: 0,
commission_rate: 2.5,
},
]);

if (agentError) {
throw new Error(`Failed to create agent profile: ${agentError.message}`);
}
}

} catch (error) {
setLoading(false);
throw error;
}
};

const signIn = async (email: string, password: string) => {
try {
setLoading(true);

const { data, error } = await supabase.auth.signInWithPassword({
email,
password,
});

if (error) {
setLoading(false);
throw error;
}

if (data.user) {
// The auth state change listener will handle setting supabaseUser and loading
}

} catch (error) {
setLoading(false);
throw error;
}
};

const signOut = async () => {
try {
setLoading(true);

const { error } = await supabase.auth.signOut();
if (error) {
throw error;
}

// Clear state and cache immediately
setUser(null);
setSupabaseUser(null);
setCachedUser(null);
setLoading(false);

} catch (error) {
setLoading(false);
throw error;
}
};

const updateProfile = async (updates: Partial<User>) => {
if (!user) throw new Error('No user logged in');

try {
// Handle user table updates
const userUpdates: any = {};
const agentUpdates: any = {};

// Separate updates by table
if ('email' in updates) userUpdates.email = updates.email;
if ('full_name' in updates) userUpdates.full_name = updates.full_name;
if ('phone' in updates) userUpdates.phone = updates.phone;
if ('avatar_url' in updates) userUpdates.avatar_url = updates.avatar_url;
if ('role' in updates && (updates.role === 'buyer' || updates.role === 'agent' || updates.role === 'admin')) {
userUpdates.role = updates.role;
}

// Handle agent table updates
if (user.role === 'agent') {
if ('bio' in updates) agentUpdates.bio = updates.bio;
if ('license_number' in updates) agentUpdates.license_number = updates.license_number;
if ('experience_years' in updates) agentUpdates.experience_years = updates.experience_years;
if ('specializations' in updates) agentUpdates.specializations = updates.specializations;
if ('commission_rate' in updates) agentUpdates.commission_rate = updates.commission_rate;
}

// Update user table
if (Object.keys(userUpdates).length > 0) {
const { error: userError } = await supabase
.from('users')
.update(userUpdates)
.eq('id', user.id);

if (userError) {
console.error('❌ User profile update error:', userError);
throw userError;
}
}

// Update agent table if user is an agent and there are agent fields to update
if (user.role === 'agent' && Object.keys(agentUpdates).length > 0) {
const { error: agentError } = await supabase
.from('agents')
.update(agentUpdates)
.eq('id', user.id);

if (agentError) {
console.error('❌ Agent profile update error:', agentError);
throw agentError;
}
}

const updatedUser = { ...user, ...updates };
setUser(updatedUser);
setCachedUser(updatedUser); // Update cache
} catch (error) {
console.error('❌ Error in updateProfile:', error);
throw error;
}
};

const resetPassword = async (email: string) => {
try {
console.log('🔄 Resetting password for:', email);

const { error } = await supabase.auth.resetPasswordForEmail(email, {
redirectTo: `${window.location.origin}/reset-password`,
});

if (error) {
console.error('❌ Password reset error:', error);
throw error;
}

} catch (error) {
console.error('❌ Error in resetPassword:', error);
throw error;
}
};
const value = {
user,
supabaseUser,
loading,
signUp,
signIn,
signOut,
updateProfile,
resetPassword,
fetchUserProfile,
};

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 