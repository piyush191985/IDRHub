# Land Property Implementation Guide

## Overview

This implementation adds proper support for land properties in the IDRHub estate platform. Land properties don't have bedrooms or bathrooms, so the system now handles this appropriately.

## Changes Made

### 1. **Database Schema Updates**

#### Migration: `20250711000000_allow_null_bedrooms_bathrooms.sql`
- Allows `bedrooms` and `bathrooms` columns to be NULL
- Updates existing land properties to have NULL values for these fields
- Adds documentation comments to the columns

```sql
-- Update existing land properties
UPDATE properties 
SET bedrooms = NULL, bathrooms = NULL 
WHERE property_type = 'land';

-- Allow NULL values
ALTER TABLE properties 
ALTER COLUMN bedrooms DROP NOT NULL,
ALTER COLUMN bedrooms DROP DEFAULT;

ALTER TABLE properties 
ALTER COLUMN bathrooms DROP NOT NULL,
ALTER COLUMN bathrooms DROP DEFAULT;
```

### 2. **TypeScript Type Updates**

#### `src/types/index.ts`
- Updated `Property` interface to make `bedrooms` and `bathrooms` optional
- Changed from `number` to `number?` to allow undefined values

```typescript
export interface Property {
  // ... other fields
  bedrooms?: number;
  bathrooms?: number;
  // ... other fields
}
```

### 3. **AddProperty Form Updates**

#### `src/pages/AddProperty.tsx`

**Conditional Field Display:**
- Bedrooms and bathrooms fields are hidden when "land" is selected
- Year built field is also hidden for land properties

**Validation Logic:**
- For land properties: Only requires title, property type, price, square feet, and features
- For other properties: Requires all fields including bedrooms, bathrooms, and year built

**Data Submission:**
- For land properties: Sets bedrooms, bathrooms, and year_built to `undefined`
- For other properties: Converts values to numbers as before

```typescript
const propertyToInsert = {
  // ... other fields
  bedrooms: propertyData.property_type === 'land' ? undefined : Number(propertyData.bedrooms),
  bathrooms: propertyData.property_type === 'land' ? undefined : Number(propertyData.bathrooms),
  year_built: propertyData.property_type === 'land' ? undefined : (propertyData.year_built ? Number(propertyData.year_built) : undefined),
  // ... other fields
};
```

### 4. **PropertyDetailsPage Updates**

#### `src/pages/PropertyDetailsPage.tsx`

**Conditional Display:**
- Bedrooms and bathrooms cards are hidden for land properties
- Grid layout adjusts from 4 columns to 3 columns for land properties

**Social Sharing:**
- Different description format for land properties
- Excludes bedroom/bathroom information for land

```typescript
// For land properties
description={`${property.title} - ₹${property.price.toLocaleString()} • ${property.square_feet} sq ft • ${property.city}, ${property.state} | IDRHub`}

// For other properties
description={`${property.title} - ₹${property.price.toLocaleString()} • ${property.bedrooms || 0} bed • ${property.bathrooms || 0} bath • ${property.square_feet} sq ft • ${property.city}, ${property.state} | IDRHub`}
```

### 5. **SEO Component Updates**

#### `src/components/common/SEO.tsx`

**Meta Tags:**
- Only includes bedroom/bathroom information if values exist
- Structured data (JSON-LD) conditionally includes these fields

```typescript
// Only include bedrooms and bathrooms if they exist
if (property.bedrooms) details.push(`${property.bedrooms} bed`);
if (property.bathrooms) details.push(`${property.bathrooms} bath`);

// Structured data
...(property.bedrooms && { "numberOfBedrooms": property.bedrooms }),
...(property.bathrooms && { "numberOfBathroomsTotal": property.bathrooms }),
```

## How It Works

### 1. **Adding a Land Property**
1. User selects "land" as property type
2. Bedrooms, bathrooms, and year built fields are automatically hidden
3. User fills in required fields: title, price, square feet, features, location
4. System saves with `undefined` values for bedrooms/bathrooms/year_built

### 2. **Viewing a Land Property**
1. Property details page shows only relevant information
2. No bedroom/bathroom cards displayed
3. Social sharing excludes bedroom/bathroom information
4. SEO meta tags are properly formatted

### 3. **Database Storage**
- Land properties: `bedrooms = NULL`, `bathrooms = NULL`, `year_built = NULL`
- Other properties: Normal number values

## Testing

### 1. **Add Land Property**
1. Go to Add Property page
2. Select "land" as property type
3. Verify bedrooms/bathrooms/year built fields are hidden
4. Fill in required fields and submit
5. Verify property is saved successfully

### 2. **View Land Property**
1. Go to a land property details page
2. Verify no bedroom/bathroom cards are shown
3. Check social sharing description excludes bedroom/bathroom info
4. Verify grid layout is 3 columns instead of 4

### 3. **Database Verification**
1. Check database for land properties
2. Verify `bedrooms` and `bathrooms` are NULL
3. Verify other properties still have number values

## Benefits

1. **Better UX**: Users don't see irrelevant fields for land properties
2. **Data Integrity**: Proper NULL values in database for land properties
3. **SEO Optimization**: Correct meta tags for different property types
4. **Social Sharing**: Appropriate descriptions for each property type
5. **Flexibility**: Easy to add more property types in the future

## Future Enhancements

1. **Additional Property Types**: Could add support for commercial properties, parking spaces, etc.
2. **Custom Fields**: Different property types could have different custom fields
3. **Validation Rules**: Property-type-specific validation rules
4. **Search Filters**: Filter by property type with appropriate fields

## Migration Notes

- Existing land properties will be automatically updated to have NULL bedrooms/bathrooms
- No data loss for existing properties
- Backward compatible with existing code
- New properties will use the updated logic

## Troubleshooting

### Common Issues

1. **Fields still showing for land properties:**
   - Clear browser cache
   - Check that property type is exactly "land"
   - Verify the conditional logic is working

2. **Database errors:**
   - Run the migration manually if needed
   - Check that NULL values are allowed in the database

3. **TypeScript errors:**
   - Ensure Property interface is updated
   - Check that optional fields are properly handled

### Debug Commands

```sql
-- Check land properties in database
SELECT id, title, property_type, bedrooms, bathrooms 
FROM properties 
WHERE property_type = 'land';

-- Check property types distribution
SELECT property_type, COUNT(*) 
FROM properties 
GROUP BY property_type;
``` 