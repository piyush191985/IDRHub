-- Fix audit_logs trigger function to properly capture user information
-- This migration improves the log_audit_event function to work with Supabase auth

-- Drop existing triggers first
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
DROP TRIGGER IF EXISTS audit_properties_trigger ON properties;
DROP TRIGGER IF EXISTS audit_agents_trigger ON agents;
DROP TRIGGER IF EXISTS audit_favorites_trigger ON favorites;

-- Drop the old function
DROP FUNCTION IF EXISTS log_audit_event();

-- Create improved function to automatically log audit events
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  current_user_agent TEXT;
BEGIN
  -- Get current user ID from Supabase auth context
  current_user_id := auth.uid();
  
  -- Get user agent from request headers (if available)
  current_user_agent := current_setting('request.headers', TRUE)::jsonb->>'user-agent';
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      user_id, 
      action, 
      table_name, 
      record_id, 
      new_values, 
      ip_address, 
      user_agent,
      created_at
    )
    VALUES (
      current_user_id,
      'CREATE',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(NEW),
      inet_client_addr(),
      current_user_agent,
      NOW()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      user_id, 
      action, 
      table_name, 
      record_id, 
      old_values, 
      new_values, 
      ip_address, 
      user_agent,
      created_at
    )
    VALUES (
      current_user_id,
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW),
      inet_client_addr(),
      current_user_agent,
      NOW()
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      user_id, 
      action, 
      table_name, 
      record_id, 
      old_values, 
      ip_address, 
      user_agent,
      created_at
    )
    VALUES (
      current_user_id,
      'DELETE',
      TG_TABLE_NAME,
      OLD.id::TEXT,
      to_jsonb(OLD),
      inet_client_addr(),
      current_user_agent,
      NOW()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers for audit logging on key tables
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_properties_trigger
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_agents_trigger
  AFTER INSERT OR UPDATE OR DELETE ON agents
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_favorites_trigger
  AFTER INSERT OR UPDATE OR DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Also add triggers for bookings table
CREATE TRIGGER audit_bookings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Add trigger for messages table
CREATE TRIGGER audit_messages_trigger
  AFTER INSERT OR UPDATE OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Add trigger for transactions table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    EXECUTE 'CREATE TRIGGER audit_transactions_trigger
      AFTER INSERT OR UPDATE OR DELETE ON transactions
      FOR EACH ROW EXECUTE FUNCTION log_audit_event()';
  END IF;
END $$; 