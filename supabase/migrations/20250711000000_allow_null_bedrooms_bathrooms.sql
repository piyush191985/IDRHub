-- Migration to allow null values for bedrooms and bathrooms
-- This is needed for land properties which don't have bedrooms/bathrooms

-- First, update existing records to set bedrooms and bathrooms to NULL for land properties
UPDATE properties 
SET bedrooms = NULL, bathrooms = NULL 
WHERE property_type = 'land';

-- Alter the columns to allow NULL values
ALTER TABLE properties 
ALTER COLUMN bedrooms DROP NOT NULL,
ALTER COLUMN bedrooms DROP DEFAULT;

ALTER TABLE properties 
ALTER COLUMN bathrooms DROP NOT NULL,
ALTER COLUMN bathrooms DROP DEFAULT;

-- Add a comment to document the change
COMMENT ON COLUMN properties.bedrooms IS 'Number of bedrooms. NULL for land properties.';
COMMENT ON COLUMN properties.bathrooms IS 'Number of bathrooms. NULL for land properties.'; 