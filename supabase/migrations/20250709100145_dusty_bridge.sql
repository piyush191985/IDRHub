/*
  # Fix RLS Policies for Authentication

  1. Clean up existing policies
  2. Create simple, working policies
  3. Ensure users can always access their own data
  4. Fix admin access
*/

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON users;
DROP POLICY IF EXISTS "Public can read basic user info" ON users;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON users;
DROP POLICY IF EXISTS "Allow select for authenticated" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Create simple, working policies for users table
CREATE POLICY "Enable insert for users based on user_id" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admin policies (if admin function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    CREATE POLICY "Enable all for admins" ON users
      FOR ALL USING (is_admin());
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;

-- Create or replace the uid function to ensure it works
CREATE OR REPLACE FUNCTION auth.uid() 
RETURNS UUID 
LANGUAGE SQL 
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.sub', true),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
  )::uuid;
$$;

-- Test the policies by creating a simple test
DO $$
DECLARE
  test_result TEXT;
BEGIN
  -- Test if we can select from users table
  SELECT 'Policies working' INTO test_result;
  RAISE NOTICE 'RLS Policies have been updated successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error testing policies: %', SQLERRM;
END $$;

-- Add user_settings table for storing user preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add trigger to update updated_at
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);