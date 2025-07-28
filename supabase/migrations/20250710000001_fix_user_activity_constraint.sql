-- Fix user_activity table constraint
-- This migration adds the unique constraint on user_id for the user_activity table

-- Add unique constraint to user_id if it doesn't exist
DO $$ 
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_activity_user_id_key'
    ) THEN
        -- Add unique constraint
        ALTER TABLE user_activity ADD CONSTRAINT user_activity_user_id_key UNIQUE (user_id);
    END IF;
END $$; 

-- Only allow users whose role has the 'edit_properties' permission
CREATE POLICY "Allow by role permission"
  ON properties
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN custom_roles r ON u.role = r.name
      WHERE u.id = auth.uid()
      AND r.permissions @> ARRAY['edit_properties']
    )
  );

INSERT INTO custom_roles (name, description, permissions)
VALUES
  ('broker', 'Office broker', ARRAY[
    'manage_agents', 'approve_properties', 'view_all_properties', 'view_all_transactions', 'manage_office'
  ]),
  ('office_manager', 'Manages office operations', ARRAY[
    'manage_agents', 'manage_office', 'view_all_properties', 'view_all_transactions'
  ]),
  ('marketing', 'Marketing team', ARRAY[
    'create_marketing_materials', 'manage_listings_photos', 'schedule_open_houses', 'view_properties'
  ]),
  ('transaction_coordinator', 'Handles transaction paperwork', ARRAY[
    'manage_transactions', 'upload_documents', 'view_all_transactions'
  ]),
  ('auditor', 'Can audit system activity', ARRAY[
    'view_audit_logs', 'view_transactions'
  ]);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES users(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES users(id) ON DELETE SET NULL,
  price numeric,
  status text CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) NOT NULL DEFAULT 'pending',
  offer_date timestamptz,
  contract_date timestamptz,
  closing_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create paperwork table
CREATE TABLE IF NOT EXISTS paperwork (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_url text NOT NULL,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
  uploaded_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);