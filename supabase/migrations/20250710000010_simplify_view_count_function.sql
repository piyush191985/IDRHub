-- Simplify view count function to ensure it works
-- This migration creates a simple, reliable view count function

-- Drop the existing function
DROP FUNCTION IF EXISTS record_property_view_with_count(UUID);

-- Create a simple function that always increments view count
CREATE OR REPLACE FUNCTION record_property_view_with_count(property_id UUID)
RETURNS void AS $$
BEGIN
  -- Always increment the view count
  UPDATE properties 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = property_id;
  
  -- Always record the view for analytics
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