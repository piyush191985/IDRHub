-- Advanced Admin Controls Migration
-- This migration adds audit logs, user activity tracking, and custom roles

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'READ')),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  current_page TEXT,
  session_duration INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create custom_roles table
CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to automatically log audit events
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address, user_agent)
    VALUES (
      COALESCE(current_setting('app.current_user_id', TRUE)::UUID, NULL),
      'CREATE',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(NEW),
      inet_client_addr(),
      current_setting('app.user_agent', TRUE)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
    VALUES (
      COALESCE(current_setting('app.current_user_id', TRUE)::UUID, NULL),
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW),
      inet_client_addr(),
      current_setting('app.user_agent', TRUE)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, ip_address, user_agent)
    VALUES (
      COALESCE(current_setting('app.current_user_id', TRUE)::UUID, NULL),
      'DELETE',
      TG_TABLE_NAME,
      OLD.id::TEXT,
      to_jsonb(OLD),
      inet_client_addr(),
      current_setting('app.user_agent', TRUE)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit logging on key tables
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

-- Create function to update user activity
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity (user_id, last_seen, is_online, current_page)
  VALUES (
    NEW.user_id,
    NOW(),
    TRUE,
    current_setting('app.current_page', TRUE)
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    last_seen = NOW(),
    is_online = TRUE,
    current_page = EXCLUDED.current_page,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark users as offline after inactivity
CREATE OR REPLACE FUNCTION mark_users_offline()
RETURNS void AS $$
BEGIN
  UPDATE user_activity 
  SET is_online = FALSE, updated_at = NOW()
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen ON user_activity(last_seen);
CREATE INDEX IF NOT EXISTS idx_user_activity_is_online ON user_activity(is_online);

-- Set up RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;

-- Admin can read all audit logs
CREATE POLICY "Admin can read audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Allow system to insert audit logs (for triggers)
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Admin can read all user activity
CREATE POLICY "Admin can read user activity" ON user_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Users can read their own activity
CREATE POLICY "Users can read own activity" ON user_activity
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own activity
CREATE POLICY "Users can update own activity" ON user_activity
  FOR UPDATE USING (user_id = auth.uid());

-- Users can insert their own activity
CREATE POLICY "Users can insert own activity" ON user_activity
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin can manage custom roles
CREATE POLICY "Admin can manage custom roles" ON custom_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Insert some sample custom roles
INSERT INTO custom_roles (name, description, permissions) VALUES
  ('Property Manager', 'Can manage properties and view basic analytics', 
   ARRAY['properties:read', 'properties:write', 'properties:delete', 'analytics:read']),
  ('Support Agent', 'Can view user issues and provide support', 
   ARRAY['users:read', 'messages:read', 'messages:write', 'support:read']),
  ('Content Moderator', 'Can moderate content and approve listings', 
   ARRAY['properties:read', 'properties:approve', 'reviews:read', 'reviews:moderate']);

-- Note: For automatic offline marking, you can:
-- 1. Use Supabase Edge Functions with scheduled triggers
-- 2. Set up a cron job on your server to call mark_users_offline()
-- 3. Use a service like Vercel Cron to periodically call the function
-- 4. Implement client-side polling to regularly check and update status
-- 
-- For now, users will be marked offline when they become inactive (handled by the client) 