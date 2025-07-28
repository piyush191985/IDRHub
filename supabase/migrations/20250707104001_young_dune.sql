/*
# IDRHub Database Schema

This migration creates the complete database schema for the IDRHub real estate platform.

## Tables Created:
1. **users** - User profiles with role-based access
2. **agents** - Extended agent profiles with verification and ratings
3. **properties** - Property listings with comprehensive details
4. **inquiries** - Buyer inquiries about properties
5. **tours** - Scheduled property tours
6. **messages** - Real-time messaging between users
7. **favorites** - User favorite properties
8. **saved_searches** - User saved search criteria
9. **notifications** - User notifications
10. **analytics** - Platform analytics and tracking
11. **property_views** - Property view tracking
12. **reviews** - Agent and property reviews

## Security:
- Row Level Security (RLS) enabled on all tables
- Proper access policies for each user role
- Secure data isolation between users

## Features:
- Real-time subscriptions for messages and notifications
- Comprehensive search and filtering
- Analytics and reporting
- File upload support for property images
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'agent', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents table (extends users for agents)
CREATE TABLE IF NOT EXISTS agents (
  id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  license_number TEXT,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  specializations TEXT[],
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_sales INTEGER DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 2.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms DECIMAL(3,1) NOT NULL DEFAULT 0,
  square_feet INTEGER,
  lot_size INTEGER,
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'condo', 'apartment', 'townhouse', 'land')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'sold')),
  year_built INTEGER,
  features TEXT[],
  images TEXT[],
  virtual_tour_url TEXT,
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tours table
CREATE TABLE IF NOT EXISTS tours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration INTEGER DEFAULT 60, -- in minutes
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL,
  email_alerts BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'inquiry', 'tour', 'favorite')),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property views table (for detailed view tracking)
CREATE TABLE IF NOT EXISTS property_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, reviewer_id, property_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(city, state);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_approved ON properties(is_approved);

CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer_id ON inquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_agent_id ON inquiries(agent_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

CREATE INDEX IF NOT EXISTS idx_tours_property_id ON tours(property_id);
CREATE INDEX IF NOT EXISTS idx_tours_buyer_id ON tours(buyer_id);
CREATE INDEX IF NOT EXISTS idx_tours_agent_id ON tours(agent_id);
CREATE INDEX IF NOT EXISTS idx_tours_scheduled_date ON tours(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

CREATE INDEX IF NOT EXISTS idx_analytics_property_id ON analytics(property_id);
CREATE INDEX IF NOT EXISTS idx_analytics_agent_id ON analytics(agent_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);


-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow public read access (optional, depending on what fields are exposed)
CREATE POLICY "Public can read basic user info" ON users
  FOR SELECT USING (true);


-- RLS Policies for agents table
CREATE POLICY "Agents can read own profile" ON agents
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Agents can update own profile" ON agents
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can read verified agent profiles" ON agents
  FOR SELECT USING (verified = true);

-- RLS Policies for properties table
CREATE POLICY "Anyone can read approved properties" ON properties
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Agents can read own properties" ON properties
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agent can update own property"
  ON properties
  FOR UPDATE
  USING (agent_id = auth.uid());

-- RLS Policies for inquiries table
CREATE POLICY "Users can read own inquiries" ON inquiries
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = agent_id);

CREATE POLICY "Buyers can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Agents can update inquiries for their properties" ON inquiries
  FOR UPDATE USING (auth.uid() = agent_id);

-- RLS Policies for tours table
CREATE POLICY "Users can read own tours" ON tours
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = agent_id);

CREATE POLICY "Buyers can create tours" ON tours
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Agents can update tours for their properties" ON tours
  FOR UPDATE USING (auth.uid() = agent_id);

-- RLS Policies for messages table
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- RLS Policies for favorites table
CREATE POLICY "Users can read own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for saved_searches table
CREATE POLICY "Users can read own saved searches" ON saved_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved searches" ON saved_searches
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notifications table
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for analytics table
CREATE POLICY "Anyone can insert analytics" ON analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Agents can read analytics for their properties" ON analytics
  FOR SELECT USING (
    auth.uid() = agent_id OR 
    EXISTS (
      SELECT 1 FROM properties p 
      WHERE p.id = analytics.property_id AND p.agent_id = auth.uid()
    )
  );

-- RLS Policies for property_views table
CREATE POLICY "Anyone can insert property views" ON property_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Agents can read views for their properties" ON property_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties p 
      WHERE p.id = property_views.property_id AND p.agent_id = auth.uid()
    )
  );

-- RLS Policies for reviews table
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update agent rating when a new review is added
CREATE OR REPLACE FUNCTION update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE agents SET rating = (
        SELECT AVG(rating)::DECIMAL(3,2) 
        FROM reviews 
        WHERE agent_id = NEW.agent_id
    ) WHERE id = NEW.agent_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update agent rating
CREATE TRIGGER update_agent_rating_trigger
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_agent_rating();

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