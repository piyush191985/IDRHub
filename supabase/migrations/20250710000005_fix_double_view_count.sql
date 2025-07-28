-- Fix double view count issue
-- This migration combines both view tracking functions into one

-- Drop the existing functions
DROP FUNCTION IF EXISTS increment_view_count(UUID);
DROP FUNCTION IF EXISTS record_property_view(UUID);

-- Create a single function that handles both view count increment and detailed tracking
CREATE OR REPLACE FUNCTION record_property_view_with_count(property_id UUID)
RETURNS void AS $$
BEGIN
  -- Increment the view count
  UPDATE properties 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = property_id;
  
  -- Record detailed view information (only if user is authenticated)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO property_views (property_id, user_id, ip_address, user_agent)
    VALUES (
      property_id,
      auth.uid(),
      inet_client_addr(),
      current_setting('request.headers', TRUE)::jsonb->>'user-agent'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION record_property_view_with_count(UUID) TO authenticated; 