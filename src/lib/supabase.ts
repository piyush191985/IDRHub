import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react',
    },
  },
});

// Session debugging utilities
export const debugSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('🔍 Session Debug Info:');
    console.log('Session exists:', !!session);
    console.log('User ID:', session?.user?.id);
    console.log('User email:', session?.user?.email);
    console.log('Access token exists:', !!session?.access_token);
    console.log('Refresh token exists:', !!session?.refresh_token);
    console.log('Session error:', error);
    return { session, error };
  } catch (err) {
    console.error('❌ Error debugging session:', err);
    return { session: null, error: err };
  }
};

// Simple session test
export const testSession = async () => {
  try {
    console.log('🔍 Testing basic session...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session error:', error);
      return { error };
    }
    
    if (!session) {
      console.log('ℹ️ No active session');
      return { session: null };
    }
    
    console.log('✅ Session found:', {
      userId: session.user?.id,
      email: session.user?.email,
      expiresAt: session.expires_at,
      accessToken: !!session.access_token,
      refreshToken: !!session.refresh_token
    });
    
    return { session };
  } catch (error) {
    console.error('❌ Session test error:', error);
    return { error };
  }
};

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROPERTY_IMAGES: 'property-images',
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
} as const;

// Helper function to get public URL for storage
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Helper function to upload file
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
    });

  if (error) throw error;
  return data;
};

// Helper function to delete file
export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};

// Function to clear localStorage (for testing)
export const clearLocalStorage = () => {
  localStorage.removeItem('uploadedFiles');
  console.log('Cleared uploadedFiles from localStorage');
};

// Test function to check Supabase Storage accessibility
export const testSupabaseStorage = async () => {
  try {
    console.log('Testing Supabase Storage accessibility...');
    
    // Try to list files in properties bucket
    const { data: propertiesList, error: propertiesError } = await supabase.storage
      .from('properties')
      .list();
    
    console.log('Properties bucket list result:', { data: propertiesList, error: propertiesError });
    
    // Try to list files in avatars bucket
    const { data: avatarsList, error: avatarsError } = await supabase.storage
      .from('avatars')
      .list();
    
    console.log('Avatars bucket list result:', { data: avatarsList, error: avatarsError });
    
    return {
      properties: { data: propertiesList, error: propertiesError },
      avatars: { data: avatarsList, error: avatarsError }
    };
  } catch (error) {
    console.error('Supabase Storage test error:', error);
    return { error };
  }
};

