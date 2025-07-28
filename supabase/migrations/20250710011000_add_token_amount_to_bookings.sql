-- Add token_amount to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS token_amount numeric; 