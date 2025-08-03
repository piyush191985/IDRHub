-- Create RLS policies for transactions table
-- This migration adds Row Level Security policies for the transactions table

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agents can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can manage own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can view transactions for their properties" ON public.transactions;
DROP POLICY IF EXISTS "Agents can manage transactions for their properties" ON public.transactions;

-- Policy 1: Agents can view transactions they created
CREATE POLICY "Agents can view own transactions" ON public.transactions
FOR SELECT USING (
  agent_id = auth.uid()
);

-- Policy 2: Agents can manage transactions they created
CREATE POLICY "Agents can manage own transactions" ON public.transactions
FOR ALL USING (
  agent_id = auth.uid()
);

-- Policy 3: Agents can view transactions for properties they own
CREATE POLICY "Agents can view transactions for their properties" ON public.transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = transactions.property_id 
    AND properties.agent_id = auth.uid()
  )
);

-- Policy 4: Agents can manage transactions for properties they own
CREATE POLICY "Agents can manage transactions for their properties" ON public.transactions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = transactions.property_id 
    AND properties.agent_id = auth.uid()
  )
);

-- Policy 5: Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON public.transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Policy 6: Admins can manage all transactions
CREATE POLICY "Admins can manage all transactions" ON public.transactions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Add indexes for better performance with RLS
CREATE INDEX IF NOT EXISTS idx_transactions_agent_id ON public.transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_property_id ON public.transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

-- Add a function to help with transaction management for agents
CREATE OR REPLACE FUNCTION get_transactions_for_agent(agent_uuid uuid)
RETURNS TABLE (
  transaction_id uuid,
  property_id uuid,
  property_title text,
  buyer_name text,
  seller_name text,
  price numeric,
  status text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as transaction_id,
    t.property_id,
    p.title as property_title,
    u1.full_name as buyer_name,
    u2.full_name as seller_name,
    t.price,
    t.status,
    t.created_at
  FROM public.transactions t
  LEFT JOIN public.properties p ON t.property_id = p.id
  LEFT JOIN public.users u1 ON t.buyer_id = u1.id
  LEFT JOIN public.users u2 ON t.seller_id = u2.id
  WHERE t.agent_id = agent_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a function to help with admin transaction management
CREATE OR REPLACE FUNCTION get_all_transactions_for_admin()
RETURNS TABLE (
  transaction_id uuid,
  property_id uuid,
  property_title text,
  agent_id uuid,
  agent_name text,
  buyer_name text,
  seller_name text,
  price numeric,
  status text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as transaction_id,
    t.property_id,
    p.title as property_title,
    t.agent_id,
    u3.full_name as agent_name,
    u1.full_name as buyer_name,
    u2.full_name as seller_name,
    t.price,
    t.status,
    t.created_at
  FROM public.transactions t
  LEFT JOIN public.properties p ON t.property_id = p.id
  LEFT JOIN public.users u1 ON t.buyer_id = u1.id
  LEFT JOIN public.users u2 ON t.seller_id = u2.id
  LEFT JOIN public.users u3 ON t.agent_id = u3.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT EXECUTE ON FUNCTION get_transactions_for_agent(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_transactions_for_admin() TO authenticated;

-- Add comments for documentation
COMMENT ON POLICY "Agents can view own transactions" ON public.transactions IS 'Allows agents to view transactions they created';
COMMENT ON POLICY "Agents can manage own transactions" ON public.transactions IS 'Allows agents to manage transactions they created';
COMMENT ON POLICY "Agents can view transactions for their properties" ON public.transactions IS 'Allows agents to view transactions for properties they own';
COMMENT ON POLICY "Agents can manage transactions for their properties" ON public.transactions IS 'Allows agents to manage transactions for properties they own';
COMMENT ON POLICY "Admins can view all transactions" ON public.transactions IS 'Allows admins to view all transactions in the system';
COMMENT ON POLICY "Admins can manage all transactions" ON public.transactions IS 'Allows admins to manage all transactions in the system'; 