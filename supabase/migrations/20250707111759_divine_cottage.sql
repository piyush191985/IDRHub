/*
  # Fix Database Schema and Sample Data

  1. Schema Changes
    - Remove foreign key constraint from users table that references auth.users
    - Change first_name and last_name to single full_name field
    - Update all related queries and constraints

  2. Sample Data
    - Insert comprehensive sample data without foreign key conflicts
    - Use full names instead of separate first/last names
    - Include all property types, agents, buyers, and interactions

  3. Security
    - Maintain all RLS policies
    - Ensure data integrity with proper constraints
*/

-- First, remove the foreign key constraint that's causing issues
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Add full_name column and populate it from existing first_name and last_name
DO $$
BEGIN
  -- Add full_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE users ADD COLUMN full_name text;
  END IF;
  
  -- Update existing records to combine first_name and last_name
  UPDATE users SET full_name = CONCAT(first_name, ' ', last_name) WHERE full_name IS NULL;
  
  -- Make full_name NOT NULL after populating
  ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
  
  -- Drop the old columns
  ALTER TABLE users DROP COLUMN IF EXISTS first_name;
  ALTER TABLE users DROP COLUMN IF EXISTS last_name;
END $$;

-- Update agents table to use full_name as well
DO $$
BEGIN
  -- Check if we need to update the agents table structure
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agents' AND column_name = 'first_name'
  ) THEN
    -- Add full_name column to agents if needed
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'agents' AND column_name = 'full_name'
    ) THEN
      ALTER TABLE agents ADD COLUMN full_name text;
    END IF;
    
    -- Update existing agent records
    UPDATE agents SET full_name = CONCAT(first_name, ' ', last_name) WHERE full_name IS NULL;
    
    -- Drop old columns from agents
    ALTER TABLE agents DROP COLUMN IF EXISTS first_name;
    ALTER TABLE agents DROP COLUMN IF EXISTS last_name;
  END IF;
END $$;

-- Clear existing sample data to avoid conflicts
DELETE FROM analytics WHERE property_id IS NOT NULL;
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@idrhub.com' OR email LIKE '%@email.com');
DELETE FROM reviews WHERE agent_id IN (SELECT id FROM users WHERE email LIKE '%@idrhub.com');
DELETE FROM saved_searches WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@email.com');
DELETE FROM favorites WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@email.com');
DELETE FROM tours WHERE buyer_id IN (SELECT id FROM users WHERE email LIKE '%@email.com');
DELETE FROM inquiries WHERE buyer_id IN (SELECT id FROM users WHERE email LIKE '%@email.com');
DELETE FROM properties WHERE agent_id IN (SELECT id FROM users WHERE email LIKE '%@idrhub.com');
DELETE FROM agents WHERE id IN (SELECT id FROM users WHERE email LIKE '%@idrhub.com');
DELETE FROM users WHERE email LIKE '%@idrhub.com' OR email LIKE '%@email.com';

-- Insert sample data with proper structure
DO $$
DECLARE
    agent_ids UUID[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
    buyer_ids UUID[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
    property_ids UUID[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
BEGIN
    -- Insert sample agents with full_name
    INSERT INTO users (id, email, full_name, phone, role, created_at) VALUES
        (agent_ids[1], 'sarah.johnson@idrhub.com', 'Sarah Johnson', '(555) 123-4567', 'agent', NOW() - INTERVAL '2 years'),
        (agent_ids[2], 'michael.chen@idrhub.com', 'Michael Chen', '(555) 234-5678', 'agent', NOW() - INTERVAL '1.5 years'),
        (agent_ids[3], 'emma.williams@idrhub.com', 'Emma Williams', '(555) 345-6789', 'agent', NOW() - INTERVAL '3 years'),
        (agent_ids[4], 'david.brown@idrhub.com', 'David Brown', '(555) 456-7890', 'agent', NOW() - INTERVAL '5 years'),
        (agent_ids[5], 'lisa.davis@idrhub.com', 'Lisa Davis', '(555) 567-8901', 'agent', NOW() - INTERVAL '4 years'),
        (agent_ids[6], 'james.miller@idrhub.com', 'James Miller', '(555) 678-9012', 'agent', NOW() - INTERVAL '6 years'),
        (agent_ids[7], 'anna.wilson@idrhub.com', 'Anna Wilson', '(555) 789-0123', 'agent', NOW() - INTERVAL '2.5 years'),
        (agent_ids[8], 'robert.garcia@idrhub.com', 'Robert Garcia', '(555) 890-1234', 'agent', NOW() - INTERVAL '7 years'),
        (agent_ids[9], 'maria.rodriguez@idrhub.com', 'Maria Rodriguez', '(555) 901-2345', 'agent', NOW() - INTERVAL '3.5 years'),
        (agent_ids[10], 'john.anderson@idrhub.com', 'John Anderson', '(555) 012-3456', 'agent', NOW() - INTERVAL '8 years');

    -- Insert sample buyers with full_name
    INSERT INTO users (id, email, full_name, phone, role, created_at) VALUES
        (buyer_ids[1], 'alex.buyer@email.com', 'Alex Thompson', '(555) 111-2222', 'buyer', NOW() - INTERVAL '6 months'),
        (buyer_ids[2], 'jennifer.buyer@email.com', 'Jennifer Lee', '(555) 222-3333', 'buyer', NOW() - INTERVAL '3 months'),
        (buyer_ids[3], 'mark.buyer@email.com', 'Mark Taylor', '(555) 333-4444', 'buyer', NOW() - INTERVAL '1 month'),
        (buyer_ids[4], 'emily.buyer@email.com', 'Emily White', '(555) 444-5555', 'buyer', NOW() - INTERVAL '2 weeks'),
        (buyer_ids[5], 'chris.buyer@email.com', 'Chris Martin', '(555) 555-6666', 'buyer', NOW() - INTERVAL '1 week');

    -- Insert agent profiles
    INSERT INTO agents (id, license_number, bio, experience_years, specializations, verified, rating, total_sales, commission_rate) VALUES
        (agent_ids[1], 'RE123456', 'Experienced real estate professional specializing in luxury homes and first-time buyers. Committed to providing exceptional service and finding the perfect home for every client.', 8, ARRAY['Luxury Homes', 'First-Time Buyers', 'Residential'], true, 4.8, 157, 2.5),
        (agent_ids[2], 'RE234567', 'Technology-savvy agent with expertise in modern condominiums and investment properties. Fluent in English and Mandarin.', 6, ARRAY['Condominiums', 'Investment Properties', 'Downtown Living'], true, 4.9, 89, 2.3),
        (agent_ids[3], 'RE345678', 'Family-focused realtor helping families find their dream homes in great school districts. Known for attention to detail and excellent communication.', 10, ARRAY['Family Homes', 'School Districts', 'Suburban Properties'], true, 4.7, 203, 2.4),
        (agent_ids[4], 'RE456789', 'Commercial and residential expert with deep knowledge of market trends and property valuation. Former mortgage broker brings financial expertise.', 12, ARRAY['Commercial Properties', 'Market Analysis', 'Property Valuation'], true, 4.6, 145, 2.6),
        (agent_ids[5], 'RE567890', 'Relocation specialist helping clients move to and from the area. Extensive network of local service providers and deep community knowledge.', 9, ARRAY['Relocation Services', 'Local Market Expert', 'Customer Service'], true, 4.9, 178, 2.2),
        (agent_ids[6], 'RE678901', 'Luxury property specialist with expertise in high-end homes and exclusive neighborhoods. Certified negotiation expert and luxury home marketing specialist.', 15, ARRAY['Luxury Properties', 'Exclusive Neighborhoods', 'High-End Marketing'], true, 4.8, 95, 3.0),
        (agent_ids[7], 'RE789012', 'New construction and development specialist. Works closely with builders and developers to offer pre-construction opportunities and custom homes.', 7, ARRAY['New Construction', 'Custom Homes', 'Development Projects'], true, 4.7, 123, 2.4),
        (agent_ids[8], 'RE890123', 'Veteran agent with extensive experience in all types of residential properties. Known for honest advice and going above and beyond for clients.', 18, ARRAY['Residential Properties', 'Veteran Services', 'All Property Types'], true, 4.9, 267, 2.5),
        (agent_ids[9], 'RE901234', 'Bilingual agent specializing in helping Hispanic families achieve homeownership. Community advocate and first-generation homeowner herself.', 11, ARRAY['First-Time Buyers', 'Hispanic Community', 'Affordable Housing'], true, 4.8, 156, 2.3),
        (agent_ids[10], 'RE012345', 'Senior agent and team leader with decades of experience. Mentor to new agents and recognized leader in the real estate community.', 25, ARRAY['Team Leadership', 'Mentoring', 'All Property Types'], true, 4.9, 445, 2.8);

    -- Insert sample properties
    INSERT INTO properties (id, title, description, price, address, city, state, zip_code, latitude, longitude, bedrooms, bathrooms, square_feet, lot_size, property_type, status, year_built, features, images, agent_id, view_count, is_featured, is_approved) VALUES
        (property_ids[1], 'Stunning Modern Home with Mountain Views', 'This contemporary masterpiece offers breathtaking mountain views and luxurious finishes throughout. The open-concept design features soaring ceilings, floor-to-ceiling windows, and a gourmet kitchen with premium appliances. The master suite includes a spa-like bathroom and private balcony. Perfect for entertaining with a large deck and beautifully landscaped yard.', 1250000.00, '1234 Mountain View Drive', 'Denver', 'CO', '80203', 39.7392, -104.9903, 4, 3.5, 3200, 8500, 'house', 'available', 2019, ARRAY['Mountain Views', 'Gourmet Kitchen', 'Hardwood Floors', 'Fireplace', 'Deck', 'Landscaped Yard', 'Garage'], ARRAY['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[1], 245, true, true),
        
        (property_ids[2], 'Luxury Downtown Condo with City Views', 'Experience urban living at its finest in this sophisticated downtown condominium. Floor-to-ceiling windows showcase stunning city views, while the modern kitchen features quartz countertops and stainless steel appliances. Building amenities include a rooftop terrace, fitness center, and concierge service. Walking distance to restaurants, shopping, and public transportation.', 875000.00, '456 Downtown Plaza, Unit 2804', 'Seattle', 'WA', '98101', 47.6062, -122.3321, 2, 2.0, 1450, 0, 'condo', 'available', 2020, ARRAY['City Views', 'Modern Kitchen', 'Rooftop Terrace', 'Fitness Center', 'Concierge', 'In-Unit Laundry', 'Parking'], ARRAY['https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[2], 189, true, true),
        
        (property_ids[3], 'Charming Victorian in Historic District', 'Step back in time with this beautifully restored Victorian home in the heart of the historic district. Original hardwood floors, crown molding, and period fixtures blend seamlessly with modern updates. The spacious rooms feature high ceilings and elegant details. Large corner lot with mature trees and a charming garden. Walking distance to cafes, boutiques, and parks.', 725000.00, '789 Heritage Street', 'Charleston', 'SC', '29401', 32.7765, -79.9311, 3, 2.5, 2150, 6200, 'house', 'available', 1895, ARRAY['Historic Character', 'Original Hardwood', 'Crown Molding', 'Modern Updates', 'Corner Lot', 'Mature Trees', 'Garden'], ARRAY['https://images.pexels.com/photos/1571452/pexels-photo-1571452.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[3], 156, false, true),
        
        (property_ids[4], 'Elegant Townhouse with Private Patio', 'This sophisticated townhouse offers the perfect blend of privacy and community living. Three levels of thoughtfully designed space include a main floor with open living areas, a private patio perfect for entertaining, and a master suite with walk-in closet. The finished basement provides additional living space or home office. Gated community with playground and walking trails.', 650000.00, '321 Townhouse Lane', 'Austin', 'TX', '78703', 30.2672, -97.7431, 3, 2.5, 1950, 0, 'townhouse', 'available', 2018, ARRAY['Private Patio', 'Three Levels', 'Finished Basement', 'Gated Community', 'Playground', 'Walking Trails', 'Garage'], ARRAY['https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571464/pexels-photo-1571464.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[4], 134, false, true),
        
        (property_ids[5], 'Beachfront Condo with Ocean Views', 'Wake up to ocean views every morning in this stunning beachfront condominium. The open floor plan maximizes the spectacular views, while the large balcony provides the perfect spot for morning coffee or evening sunsets. The building offers resort-style amenities including a pool, spa, and direct beach access. This is coastal living at its finest.', 1100000.00, '555 Ocean Boulevard, Unit 1205', 'Miami', 'FL', '33139', 25.7617, -80.1918, 2, 2.0, 1380, 0, 'condo', 'available', 2021, ARRAY['Ocean Views', 'Beachfront', 'Large Balcony', 'Pool', 'Spa', 'Beach Access', 'Resort Amenities'], ARRAY['https://images.pexels.com/photos/1571465/pexels-photo-1571465.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571466/pexels-photo-1571466.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[5], 298, true, true),
        
        (property_ids[6], 'Spacious Family Home in Top School District', 'This beautiful family home sits on a quiet cul-de-sac in one of the areas most sought-after school districts. The open floor plan includes a large family room with fireplace, formal dining room, and updated kitchen with granite countertops. The master suite features a luxurious bathroom with soaking tub. Large backyard with mature trees perfect for children to play.', 580000.00, '678 Family Circle', 'Plano', 'TX', '75023', 33.0198, -96.6989, 4, 3.0, 2650, 9800, 'house', 'available', 2005, ARRAY['Top School District', 'Cul-de-sac', 'Family Room', 'Fireplace', 'Updated Kitchen', 'Large Backyard', 'Mature Trees'], ARRAY['https://images.pexels.com/photos/1571469/pexels-photo-1571469.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571470/pexels-photo-1571470.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[6], 167, false, true),
        
        (property_ids[7], 'Modern Loft in Arts District', 'This striking loft in the vibrant Arts District combines industrial charm with modern sophistication. Exposed brick walls, concrete floors, and soaring ceilings create a dramatic backdrop for urban living. The open floor plan includes a gourmet kitchen with stainless steel appliances and a spacious living area. Floor-to-ceiling windows flood the space with natural light.', 485000.00, '900 Arts District Way, Unit 304', 'Los Angeles', 'CA', '90021', 34.0522, -118.2437, 1, 1.0, 1100, 0, 'condo', 'available', 2017, ARRAY['Arts District', 'Exposed Brick', 'Concrete Floors', 'High Ceilings', 'Floor-to-Ceiling Windows', 'Industrial Charm', 'Gourmet Kitchen'], ARRAY['https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571462/pexels-photo-1571462.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[7], 201, true, true),
        
        (property_ids[8], 'Country Estate with Acreage', 'Escape to this magnificent country estate featuring a custom-built home on 5 acres of rolling hills. The grand foyer leads to elegant formal rooms and a great room with vaulted ceilings and stone fireplace. The gourmet kitchen includes a large island and walk-in pantry. Additional features include a three-car garage, workshop, and horse barn. Perfect for those seeking privacy and space.', 1850000.00, '123 Country Estate Drive', 'Lexington', 'KY', '40502', 38.0406, -84.5037, 5, 4.5, 4500, 217800, 'house', 'available', 2015, ARRAY['5 Acres', 'Rolling Hills', 'Vaulted Ceilings', 'Stone Fireplace', 'Gourmet Kitchen', 'Three-Car Garage', 'Horse Barn'], ARRAY['https://images.pexels.com/photos/1571473/pexels-photo-1571473.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571474/pexels-photo-1571474.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[8], 89, true, true),
        
        (property_ids[9], 'Cozy Starter Home Near University', 'This charming starter home is perfect for first-time buyers or investors. Located just minutes from the university, it features an open living area, updated kitchen, and two comfortable bedrooms. The fenced backyard provides privacy and space for gardening. Recent updates include new flooring, fresh paint, and updated fixtures throughout. Great potential for rental income.', 285000.00, '456 University Street', 'Gainesville', 'FL', '32601', 29.6516, -82.3248, 2, 1.0, 950, 4800, 'house', 'available', 1978, ARRAY['Near University', 'Updated Kitchen', 'Fenced Backyard', 'New Flooring', 'Fresh Paint', 'Investment Potential', 'Starter Home'], ARRAY['https://images.pexels.com/photos/1571475/pexels-photo-1571475.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571476/pexels-photo-1571476.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[9], 112, false, true),
        
        (property_ids[10], 'Luxury Penthouse with Panoramic Views', 'This exceptional penthouse offers the ultimate in luxury living with panoramic city and mountain views. The expansive living spaces feature custom millwork, imported stone, and premium finishes throughout. The gourmet kitchen includes professional-grade appliances and a large island. The master suite occupies an entire wing with sitting area and spa-like bathroom. Private rooftop terrace with outdoor kitchen.', 2750000.00, '789 Penthouse Drive, Unit PH1', 'San Francisco', 'CA', '94102', 37.7749, -122.4194, 3, 3.5, 3800, 0, 'condo', 'available', 2022, ARRAY['Panoramic Views', 'Custom Millwork', 'Imported Stone', 'Professional Kitchen', 'Rooftop Terrace', 'Outdoor Kitchen', 'Luxury Finishes'], ARRAY['https://images.pexels.com/photos/1571477/pexels-photo-1571477.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571478/pexels-photo-1571478.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[10], 456, true, true),
        
        (property_ids[11], 'Restored Craftsman Bungalow', 'This meticulously restored Craftsman bungalow showcases original character while offering modern conveniences. Beautiful hardwood floors, built-in cabinetry, and period lighting fixtures highlight the homes historic charm. The updated kitchen maintains the original style with modern appliances. The large front porch and mature landscaping create exceptional curb appeal.', 695000.00, '234 Craftsman Avenue', 'Portland', 'OR', '97205', 45.5152, -122.6784, 3, 2.0, 1850, 5500, 'house', 'available', 1925, ARRAY['Craftsman Style', 'Original Character', 'Hardwood Floors', 'Built-in Cabinetry', 'Period Lighting', 'Large Front Porch', 'Mature Landscaping'], ARRAY['https://images.pexels.com/photos/1571479/pexels-photo-1571479.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571480/pexels-photo-1571480.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[1], 178, false, true),
        
        (property_ids[12], 'Executive Home with Pool', 'This impressive executive home offers luxury living with a resort-style backyard featuring a sparkling pool and spa. The grand entrance leads to formal living and dining rooms, while the family room opens to a gourmet kitchen with island seating. The master suite includes a sitting area and balcony overlooking the pool. Perfect for entertaining with multiple outdoor living spaces.', 975000.00, '567 Executive Drive', 'Scottsdale', 'AZ', '85251', 33.4942, -111.9261, 4, 3.5, 3400, 12000, 'house', 'available', 2012, ARRAY['Pool', 'Spa', 'Grand Entrance', 'Gourmet Kitchen', 'Master Balcony', 'Outdoor Living', 'Resort Style'], ARRAY['https://images.pexels.com/photos/1571481/pexels-photo-1571481.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571482/pexels-photo-1571482.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[2], 223, true, true),
        
        (property_ids[13], 'Garden Apartment with Patio', 'This charming garden apartment offers comfortable living with a private patio perfect for outdoor dining. The open floor plan includes a modern kitchen with stainless steel appliances and granite countertops. Large windows provide abundant natural light, while the patio extends the living space outdoors. Community amenities include a fitness center and swimming pool.', 350000.00, '890 Garden Court, Unit 101', 'Raleigh', 'NC', '27601', 35.7796, -78.6382, 2, 2.0, 1200, 0, 'apartment', 'available', 2019, ARRAY['Private Patio', 'Modern Kitchen', 'Stainless Appliances', 'Granite Countertops', 'Large Windows', 'Fitness Center', 'Swimming Pool'], ARRAY['https://images.pexels.com/photos/1571483/pexels-photo-1571483.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571484/pexels-photo-1571484.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[3], 145, false, true),
        
        (property_ids[14], 'Lakefront Cottage with Dock', 'Escape to this peaceful lakefront cottage with private dock and stunning water views. The cozy interior features a stone fireplace, vaulted ceilings, and large windows overlooking the lake. The wraparound deck provides multiple outdoor living spaces, while the private dock offers direct lake access. Perfect for weekend retreats or year-round living.', 525000.00, '123 Lakefront Drive', 'Lake Tahoe', 'CA', '96150', 39.0968, -120.0324, 2, 1.5, 1400, 0, 'house', 'available', 2010, ARRAY['Lakefront', 'Private Dock', 'Stone Fireplace', 'Vaulted Ceilings', 'Water Views', 'Wraparound Deck', 'Lake Access'], ARRAY['https://images.pexels.com/photos/1571485/pexels-photo-1571485.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571486/pexels-photo-1571486.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[4], 189, true, true),
        
        (property_ids[15], 'New Construction Townhome', 'This brand new townhome offers modern living with the latest in design and technology. The open concept main floor includes a gourmet kitchen with quartz countertops and premium appliances. Three bedrooms upstairs provide comfortable living space, while the finished basement adds additional recreation area. Two-car garage and private patio complete this exceptional home.', 465000.00, '789 New Construction Way', 'Nashville', 'TN', '37201', 36.1627, -86.7816, 3, 2.5, 1750, 0, 'townhouse', 'available', 2023, ARRAY['New Construction', 'Modern Design', 'Gourmet Kitchen', 'Quartz Countertops', 'Finished Basement', 'Two-Car Garage', 'Private Patio'], ARRAY['https://images.pexels.com/photos/1571487/pexels-photo-1571487.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571488/pexels-photo-1571488.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[5], 167, false, true),
        
        (property_ids[16], 'Historic Brick Colonial', 'This stately brick colonial home showcases timeless architecture and modern updates. The grand foyer with curved staircase leads to elegant formal rooms with original hardwood floors and crown molding. The updated kitchen features granite countertops and professional appliances. The master suite includes a fireplace and luxurious bathroom. Beautifully landscaped grounds with mature trees.', 825000.00, '456 Colonial Drive', 'Richmond', 'VA', '23220', 37.5407, -77.4360, 4, 3.5, 3100, 8700, 'house', 'available', 1940, ARRAY['Historic Character', 'Brick Colonial', 'Curved Staircase', 'Original Hardwood', 'Crown Molding', 'Professional Kitchen', 'Mature Trees'], ARRAY['https://images.pexels.com/photos/1571489/pexels-photo-1571489.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571490/pexels-photo-1571490.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[6], 134, false, true),
        
        (property_ids[17], 'Mountain Cabin Retreat', 'This rustic mountain cabin offers the perfect escape from city life. Natural wood construction blends seamlessly with the forest setting, while the stone fireplace creates a cozy gathering space. The open floor plan includes a kitchen with rustic charm and dining area with mountain views. Large deck perfect for outdoor entertaining and wildlife viewing.', 395000.00, '234 Mountain Cabin Road', 'Gatlinburg', 'TN', '37738', 35.7143, -83.5102, 2, 1.5, 1250, 21780, 'house', 'available', 2008, ARRAY['Mountain Views', 'Natural Wood', 'Stone Fireplace', 'Forest Setting', 'Rustic Charm', 'Large Deck', 'Wildlife Viewing'], ARRAY['https://images.pexels.com/photos/1571491/pexels-photo-1571491.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571492/pexels-photo-1571492.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[7], 198, false, true),
        
        (property_ids[18], 'Waterfront Condo with Marina', 'This stunning waterfront condominium offers luxury living with direct marina access. Floor-to-ceiling windows provide panoramic water views, while the open floor plan maximizes the spectacular scenery. The gourmet kitchen features premium appliances and waterfall island. Building amenities include a pool, fitness center, and private marina with boat slips available.', 1350000.00, '567 Marina Drive, Unit 1508', 'Fort Lauderdale', 'FL', '33301', 26.1224, -80.1373, 3, 2.5, 2100, 0, 'condo', 'available', 2020, ARRAY['Waterfront', 'Marina Access', 'Water Views', 'Premium Appliances', 'Waterfall Island', 'Private Marina', 'Boat Slips'], ARRAY['https://images.pexels.com/photos/1571493/pexels-photo-1571493.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571494/pexels-photo-1571494.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[8], 287, true, true),
        
        (property_ids[19], 'Suburban Ranch with Large Lot', 'This well-maintained ranch home sits on a large corner lot in a quiet suburban neighborhood. The single-level floor plan includes a spacious living room with fireplace, updated kitchen, and three comfortable bedrooms. The large backyard features mature trees and plenty of space for outdoor activities. Attached two-car garage and storage shed included.', 425000.00, '890 Suburban Ranch Road', 'Omaha', 'NE', '68114', 41.2524, -95.9980, 3, 2.0, 1650, 11000, 'house', 'available', 1985, ARRAY['Corner Lot', 'Single Level', 'Spacious Living', 'Updated Kitchen', 'Large Backyard', 'Mature Trees', 'Two-Car Garage'], ARRAY['https://images.pexels.com/photos/1571495/pexels-photo-1571495.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571496/pexels-photo-1571496.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[9], 123, false, true),
        
        (property_ids[20], 'Urban Loft with Rooftop Access', 'This contemporary loft in the heart of downtown offers modern urban living with rooftop access. The open floor plan features polished concrete floors, exposed ductwork, and oversized windows. The kitchen includes stainless steel appliances and concrete countertops. Private rooftop terrace provides city views and outdoor entertaining space. Walking distance to restaurants and nightlife.', 545000.00, '123 Urban Loft Street, Unit 501', 'Phoenix', 'AZ', '85004', 33.4484, -112.0740, 1, 1.0, 1050, 0, 'condo', 'available', 2016, ARRAY['Downtown Location', 'Rooftop Access', 'Concrete Floors', 'Exposed Ductwork', 'City Views', 'Walking Distance', 'Urban Living'], ARRAY['https://images.pexels.com/photos/1571497/pexels-photo-1571497.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571498/pexels-photo-1571498.jpeg?auto=compress&cs=tinysrgb&w=800'], agent_ids[10], 156, false, true);

    -- Insert sample inquiries
    INSERT INTO inquiries (property_id, buyer_id, agent_id, message, status, created_at) VALUES
        (property_ids[1], buyer_ids[1], agent_ids[1], 'I am very interested in this property. Could we schedule a viewing this weekend?', 'responded', NOW() - INTERVAL '3 days'),
        (property_ids[2], buyer_ids[2], agent_ids[2], 'What are the HOA fees for this condo? Also, is there guest parking available?', 'responded', NOW() - INTERVAL '2 days'),
        (property_ids[5], buyer_ids[3], agent_ids[5], 'This beachfront condo looks amazing! What is the earliest we could schedule a tour?', 'pending', NOW() - INTERVAL '1 day'),
        (property_ids[6], buyer_ids[4], agent_ids[6], 'We love this family home! Can you provide more details about the school district ratings?', 'responded', NOW() - INTERVAL '5 days'),
        (property_ids[10], buyer_ids[5], agent_ids[10], 'Interested in the penthouse. What are the building amenities and monthly fees?', 'pending', NOW() - INTERVAL '1 day');

    -- Insert sample tours
    INSERT INTO tours (property_id, buyer_id, agent_id, scheduled_date, status, created_at) VALUES
        (property_ids[1], buyer_ids[1], agent_ids[1], NOW() + INTERVAL '2 days', 'scheduled', NOW() - INTERVAL '2 days'),
        (property_ids[2], buyer_ids[2], agent_ids[2], NOW() - INTERVAL '1 day', 'completed', NOW() - INTERVAL '3 days'),
        (property_ids[6], buyer_ids[4], agent_ids[6], NOW() + INTERVAL '1 day', 'scheduled', NOW() - INTERVAL '4 days'),
        (property_ids[8], buyer_ids[1], agent_ids[8], NOW() - INTERVAL '3 days', 'completed', NOW() - INTERVAL '5 days'),
        (property_ids[12], buyer_ids[3], agent_ids[2], NOW() + INTERVAL '3 days', 'scheduled', NOW() - INTERVAL '1 day');

    -- Insert sample favorites
    INSERT INTO favorites (user_id, property_id, created_at) VALUES
        (buyer_ids[1], property_ids[1], NOW() - INTERVAL '4 days'),
        (buyer_ids[1], property_ids[5], NOW() - INTERVAL '2 days'),
        (buyer_ids[1], property_ids[8], NOW() - INTERVAL '6 days'),
        (buyer_ids[2], property_ids[2], NOW() - INTERVAL '3 days'),
        (buyer_ids[2], property_ids[7], NOW() - INTERVAL '1 day'),
        (buyer_ids[3], property_ids[5], NOW() - INTERVAL '2 days'),
        (buyer_ids[3], property_ids[12], NOW() - INTERVAL '1 day'),
        (buyer_ids[4], property_ids[6], NOW() - INTERVAL '5 days'),
        (buyer_ids[5], property_ids[10], NOW() - INTERVAL '1 day');

    -- Insert sample saved searches
    INSERT INTO saved_searches (user_id, name, criteria, email_alerts, created_at) VALUES
        (buyer_ids[1], 'Luxury Homes Denver', '{"location": "Denver", "min_price": 800000, "max_price": 1500000, "bedrooms": 3, "property_type": "house"}', true, NOW() - INTERVAL '1 week'),
        (buyer_ids[2], 'Seattle Condos', '{"location": "Seattle", "min_price": 500000, "max_price": 1000000, "property_type": "condo"}', true, NOW() - INTERVAL '2 weeks'),
        (buyer_ids[3], 'Florida Beachfront', '{"location": "Florida", "min_price": 800000, "features": ["Beachfront", "Ocean Views"]}', false, NOW() - INTERVAL '3 days'),
        (buyer_ids[4], 'Family Homes Texas', '{"location": "Texas", "min_price": 400000, "max_price": 800000, "bedrooms": 3, "property_type": "house"}', true, NOW() - INTERVAL '1 week'),
        (buyer_ids[5], 'Investment Properties', '{"max_price": 500000, "property_type": "condo", "features": ["Investment Potential"]}', false, NOW() - INTERVAL '5 days');

    -- Insert sample reviews
    INSERT INTO reviews (agent_id, reviewer_id, property_id, rating, comment, created_at) VALUES
        (agent_ids[1], buyer_ids[1], property_ids[1], 5, 'Sarah was absolutely amazing to work with! She was knowledgeable, responsive, and made the entire process smooth. Highly recommend!', NOW() - INTERVAL '2 weeks'),
        (agent_ids[2], buyer_ids[2], property_ids[2], 5, 'Michael found us the perfect condo and negotiated a great deal. His expertise in the downtown market was invaluable.', NOW() - INTERVAL '1 week'),
        (agent_ids[3], buyer_ids[4], property_ids[6], 5, 'Emma understood exactly what we were looking for in a family home. She was patient and helped us find the perfect house in a great school district.', NOW() - INTERVAL '3 weeks'),
        (agent_ids[5], buyer_ids[3], property_ids[5], 5, 'Lisa made our relocation stress-free. She provided excellent local insights and helped us feel at home in our new city.', NOW() - INTERVAL '1 month'),
        (agent_ids[8], buyer_ids[1], property_ids[8], 5, 'Robert has incredible experience and knowledge. He guided us through a complex transaction with professionalism and care.', NOW() - INTERVAL '2 months');

    -- Insert sample notifications
    INSERT INTO notifications (user_id, title, message, type, created_at) VALUES
        (buyer_ids[1], 'New Property Match', 'A new property matching your saved search "Luxury Homes Denver" has been listed.', 'info', NOW() - INTERVAL '1 day'),
        (buyer_ids[2], 'Tour Confirmation', 'Your tour for 456 Downtown Plaza has been confirmed for tomorrow at 2:00 PM.', 'success', NOW() - INTERVAL '2 days'),
        (buyer_ids[3], 'Inquiry Response', 'The agent has responded to your inquiry about the beachfront condo.', 'info', NOW() - INTERVAL '1 day'),
        (buyer_ids[4], 'Price Reduction', 'Good news! The price has been reduced on a property in your favorites.', 'success', NOW() - INTERVAL '3 days'),
        (buyer_ids[5], 'Market Update', 'Your saved search area has new market insights available.', 'info', NOW() - INTERVAL '1 week');

    -- Insert sample analytics
    INSERT INTO analytics (property_id, agent_id, event_type, user_id, created_at) VALUES
        (property_ids[1], agent_ids[1], 'view', buyer_ids[1], NOW() - INTERVAL '3 days'),
        (property_ids[1], agent_ids[1], 'inquiry', buyer_ids[1], NOW() - INTERVAL '3 days'),
        (property_ids[1], agent_ids[1], 'favorite', buyer_ids[1], NOW() - INTERVAL '4 days'),
        (property_ids[2], agent_ids[2], 'view', buyer_ids[2], NOW() - INTERVAL '2 days'),
        (property_ids[2], agent_ids[2], 'inquiry', buyer_ids[2], NOW() - INTERVAL '2 days'),
        (property_ids[5], agent_ids[5], 'view', buyer_ids[3], NOW() - INTERVAL '1 day'),
        (property_ids[5], agent_ids[5], 'inquiry', buyer_ids[3], NOW() - INTERVAL '1 day'),
        (property_ids[6], agent_ids[6], 'view', buyer_ids[4], NOW() - INTERVAL '5 days'),
        (property_ids[6], agent_ids[6], 'inquiry', buyer_ids[4], NOW() - INTERVAL '5 days'),
        (property_ids[10], agent_ids[10], 'view', buyer_ids[5], NOW() - INTERVAL '1 day'),
        (property_ids[10], agent_ids[10], 'inquiry', buyer_ids[5], NOW() - INTERVAL '1 day');

END $$;