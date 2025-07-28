-- Fix ambiguous column reference in view count function
-- This migration fixes the SQL naming conflict

-- Drop the existing function
DROP FUNCTION IF EXISTS record_property_view_with_count(UUID);

-- Create a function that checks for recent views to prevent duplicates
CREATE OR REPLACE FUNCTION record_property_view_with_count(p_property_id UUID)
RETURNS void AS $$
DECLARE
  recent_view_count INTEGER;
BEGIN
  -- Check if there's been a view from this user in the last 5 minutes
  SELECT COUNT(*) INTO recent_view_count
  FROM property_views 
  WHERE property_id = p_property_id 
    AND user_id = auth.uid() 
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  -- Only increment if no recent view exists
  IF recent_view_count = 0 THEN
    -- Increment the view count
    UPDATE properties 
    SET view_count = COALESCE(view_count, 0) + 1 
    WHERE id = p_property_id;
  END IF;
  
  -- Always record the view for analytics (even if count wasn't incremented)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO property_views (property_id, user_id, ip_address, user_agent)
    VALUES (
      p_property_id,
      auth.uid(),
      inet_client_addr(),
      current_setting('request.headers', TRUE)::jsonb->>'user-agent'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION record_property_view_with_count(UUID) TO authenticated; 