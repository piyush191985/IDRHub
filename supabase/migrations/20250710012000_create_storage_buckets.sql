-- Create storage buckets for file uploads
-- Note: This migration should be run manually in the Supabase dashboard
-- as storage bucket creation is not supported in SQL migrations

/*
To set up Supabase Storage buckets, please follow these steps in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Storage in the left sidebar
3. Click "Create a new bucket"
4. Create the following buckets:

   Bucket Name: properties
   - Public bucket: Yes
   - File size limit: 10MB
   - Allowed MIME types: image/*

   Bucket Name: avatars
   - Public bucket: Yes
   - File size limit: 5MB
   - Allowed MIME types: image/*

5. After creating the buckets, run these SQL commands in the SQL Editor:

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

-- Create new policies that work properly
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('properties', 'avatars'));

CREATE POLICY "Allow public viewing" ON storage.objects
  FOR SELECT USING (bucket_id IN ('properties', 'avatars'));

CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (bucket_id IN ('properties', 'avatars') AND auth.role() = 'authenticated');

-- Alternative: If you want to allow only authenticated users to upload
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id IN ('properties', 'avatars') AND auth.role() = 'authenticated');

*/

-- This migration file serves as documentation
-- The actual bucket creation must be done manually in the Supabase dashboard 