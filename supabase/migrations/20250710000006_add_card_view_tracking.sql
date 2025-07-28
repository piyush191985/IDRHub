-- Add card view tracking function
-- This function records views from property cards without incrementing the count

CREATE OR REPLACE FUNCTION record_card_view(property_id UUID)
RETURNS void AS $$
BEGIN
  -- Only record detailed view information (no count increment)
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
GRANT EXECUTE ON FUNCTION record_card_view(UUID) TO authenticated; 