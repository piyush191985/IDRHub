

-- Update users table constraint to include admin role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('buyer', 'agent', 'admin'));

-- Add admin policies for users table
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    is_admin()
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    is_admin()
  );

-- Add admin policies for agents table
CREATE POLICY "Admins can read all agents" ON agents
  FOR SELECT USING (
   is_admin()
  );

CREATE POLICY "Admins can update all agents" ON agents
  FOR UPDATE USING (
   is_admin()
  );

-- Add admin policies for properties table
CREATE POLICY "Admins can read all properties" ON properties
  FOR SELECT USING (
   is_admin()
  );

CREATE POLICY "Admins can update all properties" ON properties
  FOR UPDATE USING (
    is_admin()
  );

CREATE POLICY "Admins can delete all properties" ON properties
  FOR DELETE USING (
   is_admin()
  );

-- Add admin policies for all other tables
CREATE POLICY "Admins can read all inquiries" ON inquiries
  FOR SELECT USING (
   is_admin()
  );

CREATE POLICY "Admins can read all tours" ON tours
  FOR SELECT USING (
    is_admin()
  );

CREATE POLICY "Admins can read all messages" ON messages
  FOR SELECT USING (
   is_admin()
  );

CREATE POLICY "Admins can read all favorites" ON favorites
  FOR SELECT USING (
   is_admin()
  );

CREATE POLICY "Admins can read all analytics" ON analytics
  FOR SELECT USING (
   is_admin()
  );

-- Insert a default admin user (you can change these credentials)
INSERT INTO users (id, email, full_name, phone, role, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@idrhub.com', 'System Administrator', '(555) 000-0000', 'admin', NOW())
ON CONFLICT (id) DO NOTHING;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;