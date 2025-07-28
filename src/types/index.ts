export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: 'buyer' | 'agent' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Agent extends User {
  license_number?: string;
  bio?: string;
  experience_years?: number;
  specializations?: string[];
  verified: boolean;
  rating?: number;
  total_sales?: number;
  commission_rate?: number;
  reviews?: Review[];
  review_count?: number;
  latest_review?: Review;
}

export interface Review {
  id: string;
  agent_id: string;
  reviewer_id: string;
  property_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  reviewer?: User;
  property?: Property;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  lot_size?: number;
  property_type: 'house' | 'condo' | 'apartment' | 'townhouse' | 'land' | 'villa' | 'farmhouse' | 'Duplex' | 'Penthouse' | 'Studio' | 'Bunglow' | 'Villa';
  status: 'available' | 'pending' | 'sold' | 'rented';
  year_built?: number;
  features: string[];
  images: string[];
  virtual_tour_url?: string;
  agent_id: string;
  agent?: Agent;
  created_at: string;
  updated_at: string;
  view_count: number;
  likes_count?: number;
  inquiries_count?: number;
  is_featured: boolean;
  is_approved: boolean;
}

export interface Inquiry {
  id: string;
  property_id: string;
  buyer_id: string;
  agent_id: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
  property?: Property;
  buyer?: User;
  agent?: Agent;
}

export interface Tour {
  id: string;
  property_id: string;
  buyer_id: string;
  agent_id: string;
  scheduled_date: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  buyer?: User;
  agent?: Agent;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: User;
  recipient?: User;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  criteria: SearchCriteria;
  email_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchCriteria {
  location?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  min_sqft?: number;
  max_sqft?: number;
  features?: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface Analytics {
  id: string;
  property_id?: string;
  agent_id?: string;
  event_type: 'view' | 'inquiry' | 'tour' | 'favorite';
  user_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}