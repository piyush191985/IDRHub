-- Create buyers table for external buyers
-- This migration adds a buyers table to store information about external buyers who aren't registered users

-- Create buyers table
CREATE TABLE IF NOT EXISTS public.buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  is_external boolean DEFAULT true,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_buyers_email ON public.buyers(email);
CREATE INDEX IF NOT EXISTS idx_buyers_phone ON public.buyers(phone);
CREATE INDEX IF NOT EXISTS idx_buyers_user_id ON public.buyers(user_id);
CREATE INDEX IF NOT EXISTS idx_buyers_is_external ON public.buyers(is_external);

-- Update transactions table to reference buyers
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS buyer_details_id uuid REFERENCES buyers(id) ON DELETE SET NULL;

-- Add RLS policies for buyers table
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agents can view buyers for their transactions" ON public.buyers;
DROP POLICY IF EXISTS "Agents can manage buyers for their transactions" ON public.buyers;
DROP POLICY IF EXISTS "Admins can view all buyers" ON public.buyers;
DROP POLICY IF EXISTS "Admins can manage all buyers" ON public.buyers;
DROP POLICY IF EXISTS "Users can view own buyer profile" ON public.buyers;

-- Policy 1: Agents can view buyers for their transactions
CREATE POLICY "Agents can view buyers for their transactions" ON public.buyers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.transactions 
    WHERE transactions.buyer_details_id = buyers.id 
    AND transactions.agent_id = auth.uid()
  )
);

-- Policy 2: Agents can manage buyers for their transactions
CREATE POLICY "Agents can manage buyers for their transactions" ON public.buyers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.transactions 
    WHERE transactions.buyer_details_id = buyers.id 
    AND transactions.agent_id = auth.uid()
  )
);

-- Policy 3: Admins can view all buyers
CREATE POLICY "Admins can view all buyers" ON public.buyers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Policy 4: Admins can manage all buyers
CREATE POLICY "Admins can manage all buyers" ON public.buyers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Policy 5: Users can view their own buyer profile
CREATE POLICY "Users can view own buyer profile" ON public.buyers
FOR SELECT USING (
  user_id = auth.uid()
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyers TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.buyers IS 'Stores information about external buyers who are not registered users';
COMMENT ON COLUMN public.buyers.is_external IS 'Indicates if this buyer is external (not a registered user)';
COMMENT ON COLUMN public.buyers.user_id IS 'Links to users table if buyer is a registered user';
COMMENT ON POLICY "Agents can view buyers for their transactions" ON public.buyers IS 'Allows agents to view buyers for their transactions';
COMMENT ON POLICY "Agents can manage buyers for their transactions" ON public.buyers IS 'Allows agents to manage buyers for their transactions';
COMMENT ON POLICY "Admins can view all buyers" ON public.buyers IS 'Allows admins to view all buyers in the system';
COMMENT ON POLICY "Admins can manage all buyers" ON public.buyers IS 'Allows admins to manage all buyers in the system';
COMMENT ON POLICY "Users can view own buyer profile" ON public.buyers IS 'Allows users to view their own buyer profile'; 