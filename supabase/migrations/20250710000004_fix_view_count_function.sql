-- Fix increment_view_count function to work with RLS
-- This migration updates the function to have proper permissions

-- Drop the existing function
DROP FUNCTION IF EXISTS increment_view_count(UUID);

-- Create the function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION increment_view_count(property_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE properties 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create a function to insert into property_views table for detailed tracking
CREATE OR REPLACE FUNCTION record_property_view(property_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO property_views (property_id, user_id, ip_address, user_agent)
  VALUES (
    property_id,
    auth.uid(),
    inet_client_addr(),
    current_setting('request.headers', TRUE)::jsonb->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_property_view(UUID) TO authenticated; 