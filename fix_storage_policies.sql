-- Fix Supabase Storage RLS Policies
-- Run this in your Supabase SQL Editor to fix the file upload issue

-- Note: We cannot directly modify storage.objects table as we're not the owner
-- Instead, we need to work with the existing policies or create bucket-specific policies

-- First, let's check what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- If the above query shows no policies, we need to create them through the Supabase dashboard
-- Go to your Supabase dashboard > Storage > Policies tab

-- Alternative approach: Create bucket-specific policies
-- This should work even without direct table access

-- Try to create a simple policy for the properties bucket
CREATE POLICY "properties_public_access" ON storage.objects
  FOR ALL USING (bucket_id = 'properties');

-- Try to create a simple policy for the avatars bucket  
CREATE POLICY "avatars_public_access" ON storage.objects
  FOR ALL USING (bucket_id = 'avatars');

-- If the above doesn't work, you'll need to use the Supabase dashboard approach:

/*
MANUAL SETUP IN SUPABASE DASHBOARD:

1. Go to your Supabase project dashboard
2. Navigate to Storage in the left sidebar
3. Click on the "properties" bucket
4. Go to the "Policies" tab
5. Click "New Policy"
6. Choose "Create a policy from scratch"
7. Set the following:
   - Policy Name: "Public Access"
   - Allowed operations: SELECT, INSERT
   - Target roles: public
   - Using expression: true
   - With check expression: true
8. Click "Review" and then "Save policy"
9. Repeat the same process for the "avatars" bucket

ALTERNATIVE: Use the "Enable Row Level Security" toggle
1. Go to Storage > Settings
2. Find "Row Level Security (RLS)"
3. Toggle it OFF temporarily for testing
4. Try uploading a file
5. If it works, you can leave RLS off for now, or re-enable it with proper policies
*/ 