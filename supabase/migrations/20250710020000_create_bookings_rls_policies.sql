-- Create RLS policies for bookings table
-- This migration adds Row Level Security policies for the bookings table

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agents can view bookings for their properties" ON public.bookings;
DROP POLICY IF EXISTS "Agents can manage bookings for their properties" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can create own bookings" ON public.bookings;

-- Policy 1: Agents can view bookings for properties they own
CREATE POLICY "Agents can view bookings for their properties" ON public.bookings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = bookings.property_id 
    AND properties.agent_id = auth.uid()
  )
);

-- Policy 2: Agents can update/delete bookings for properties they own
CREATE POLICY "Agents can manage bookings for their properties" ON public.bookings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = bookings.property_id 
    AND properties.agent_id = auth.uid()
  )
);

-- Policy 3: Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Policy 4: Admins can manage all bookings (insert, update, delete)
CREATE POLICY "Admins can manage all bookings" ON public.bookings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Policy 5: Customers can view their own bookings
CREATE POLICY "Customers can view own bookings" ON public.bookings
FOR SELECT USING (
  customer_id = auth.uid() OR
  customer_email = (
    SELECT email FROM public.users WHERE id = auth.uid()
  )
);

-- Policy 6: Customers can create their own bookings
CREATE POLICY "Customers can create own bookings" ON public.bookings
FOR INSERT WITH CHECK (
  customer_id = auth.uid() OR
  customer_email = (
    SELECT email FROM public.users WHERE id = auth.uid()
  )
);

-- Policy 7: Customers can update their own bookings (for status changes, etc.)
CREATE POLICY "Customers can update own bookings" ON public.bookings
FOR UPDATE USING (
  customer_id = auth.uid() OR
  customer_email = (
    SELECT email FROM public.users WHERE id = auth.uid()
  )
);

-- Add indexes for better performance with RLS
CREATE INDEX IF NOT EXISTS idx_bookings_property_agent ON public.bookings(property_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON public.bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Add a function to help with booking management
CREATE OR REPLACE FUNCTION get_bookings_for_agent(agent_uuid uuid)
RETURNS TABLE (
  booking_id uuid,
  property_id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  status text,
  created_at timestamptz,
  token_amount numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as booking_id,
    b.property_id,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.status,
    b.created_at,
    b.token_amount
  FROM public.bookings b
  INNER JOIN public.properties p ON b.property_id = p.id
  WHERE p.agent_id = agent_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a function to help with admin booking management
CREATE OR REPLACE FUNCTION get_all_bookings_for_admin()
RETURNS TABLE (
  booking_id uuid,
  property_id uuid,
  agent_id uuid,
  agent_name text,
  customer_name text,
  customer_email text,
  customer_phone text,
  status text,
  created_at timestamptz,
  token_amount numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as booking_id,
    b.property_id,
    b.agent_id,
    u.full_name as agent_name,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.status,
    b.created_at,
    b.token_amount
  FROM public.bookings b
  LEFT JOIN public.users u ON b.agent_id = u.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT EXECUTE ON FUNCTION get_bookings_for_agent(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_bookings_for_admin() TO authenticated;

-- Add comments for documentation
COMMENT ON POLICY "Agents can view bookings for their properties" ON public.bookings IS 'Allows agents to view bookings for properties they own';
COMMENT ON POLICY "Agents can manage bookings for their properties" ON public.bookings IS 'Allows agents to update/delete bookings for properties they own';
COMMENT ON POLICY "Admins can view all bookings" ON public.bookings IS 'Allows admins to view all bookings in the system';
COMMENT ON POLICY "Admins can manage all bookings" ON public.bookings IS 'Allows admins to manage all bookings in the system';
COMMENT ON POLICY "Customers can view own bookings" ON public.bookings IS 'Allows customers to view their own bookings';
COMMENT ON POLICY "Customers can create own bookings" ON public.bookings IS 'Allows customers to create their own bookings';
COMMENT ON POLICY "Customers can update own bookings" ON public.bookings IS 'Allows customers to update their own bookings'; 