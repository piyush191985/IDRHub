-- Fix audit_logs INSERT policy for triggers
-- This migration adds the missing INSERT policy for audit_logs table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Create the INSERT policy for audit_logs to allow triggers to work
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Also ensure the SELECT policy exists for admins
DROP POLICY IF EXISTS "Admin can read audit logs" ON audit_logs;

CREATE POLICY "Admin can read audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  ); 