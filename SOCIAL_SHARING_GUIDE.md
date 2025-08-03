# Social Sharing Implementation Guide

## Overview

This implementation adds rich social media sharing capabilities to your IDRHub estate platform. When users share property links on WhatsApp, Facebook, Twitter, or other social media platforms, they will see beautiful previews with property details, images, and descriptions.

## Features Implemented

### 1. **Open Graph Meta Tags**
- Dynamic meta tags for each property page
- Rich previews on Facebook, WhatsApp, LinkedIn, and other platforms
- Property-specific information: title, price, bedrooms, bathrooms, size, location
- Automatic image selection from property photos

### 2. **Social Share Buttons**
- WhatsApp sharing with formatted messages
- Facebook sharing with Open Graph previews
- Twitter sharing with property details
- Email sharing with formatted subject and body
- Copy link functionality with visual feedback
- Native sharing on mobile devices

### 3. **SEO Optimization**
- Structured data (JSON-LD) for search engines
- Proper meta descriptions and titles
- Canonical URLs
- Twitter Card support

## How It Works

### Property Pages
When someone visits a property page (e.g., `/properties/123`), the system automatically generates:

1. **Open Graph Meta Tags:**
   ```html
   <meta property="og:title" content="Beautiful 3BR Apartment | IDRHub" />
   <meta property="og:description" content="Beautiful 3BR Apartment - ₹25,00,000 • 3 bed • 2 bath • 1500 sq ft • Mumbai, Maharashtra | IDRHub" />
   <meta property="og:image" content="https://your-domain.com/property-image.jpg" />
   <meta property="og:url" content="https://your-domain.com/properties/123" />
   ```

2. **Structured Data:**
   ```json
   {
     "@context": "https://schema.org",
     "@type": "RealEstateListing",
     "name": "Beautiful 3BR Apartment",
     "price": 2500000,
     "priceCurrency": "INR",
     "numberOfBedrooms": 3,
     "numberOfBathroomsTotal": 2,
     "floorSize": {
       "@type": "QuantitativeValue",
       "value": 1500,
       "unitCode": "SQFT"
     }
   }
   ```

### Social Share Buttons
The property details page includes share buttons that:
- Format messages appropriately for each platform
- Include property details in the shared content
- Use the property's first image as the preview
- Provide visual feedback when links are copied

## Testing the Implementation

### 1. **Test Page**
Visit `/test-social-sharing` to see a test property with all sharing features.

### 2. **Manual Testing**
1. Go to any property page
2. Click the share buttons in the "Share This Property" section
3. Test on different platforms:
   - **WhatsApp:** Should show property image, title, and details
   - **Facebook:** Should show rich preview with property information
   - **Twitter:** Should include property details in the tweet
   - **Email:** Should have formatted subject and body

### 3. **Meta Tag Verification**
1. Open browser developer tools (F12)
2. Go to the Elements tab
3. Look in the `<head>` section for meta tags starting with `og:` and `twitter:`
4. Verify they contain the correct property information

### 4. **Mobile Testing**
- Test native sharing on mobile devices
- Verify WhatsApp previews on mobile
- Check Facebook sharing on mobile apps

## Files Modified/Created

### New Components
- `src/components/common/SEO.tsx` - SEO and meta tag management
- `src/components/common/SocialShare.tsx` - Social sharing buttons
- `src/pages/TestSocialSharing.tsx` - Test page for verification

### Modified Files
- `src/main.tsx` - Added HelmetProvider
- `src/App.tsx` - Added test route
- `src/pages/PropertyDetailsPage.tsx` - Added SEO and social sharing
- `src/pages/HomePage.tsx` - Added basic SEO
- `index.html` - Added default meta tags
- `public/idrhub-og-image.jpg` - Default OG image (placeholder)

## Configuration

### 1. **Default OG Image**
Replace `public/idrhub-og-image.jpg` with your actual brand image:
- Recommended size: 1200x630 pixels
- Format: JPG or PNG
- Should represent your IDRHub brand

### 2. **Social Media Handles**
Update the Twitter handle in `SEO.tsx`:
```typescript
<meta name="twitter:site" content="@your-twitter-handle" />
```

### 3. **Custom Descriptions**
Modify the description format in `PropertyDetailsPage.tsx`:
```typescript
description={`${property.title} - ₹${property.price.toLocaleString()} • ${property.bedrooms} bed • ${property.bathrooms} bath • ${property.square_feet} sq ft • ${property.city}, ${property.state} | IDRHub`}
```

## Platform-Specific Features

### WhatsApp
- Shows property image as preview
- Includes formatted property details
- Uses WhatsApp's native sharing API

### Facebook
- Rich preview with property image
- Property details in the description
- Open Graph meta tags for optimal display

### Twitter
- Property title and details in tweet
- Image preview when available
- Twitter Card meta tags

### Email
- Formatted subject line with property title
- Property details in email body
- Direct link to property page

## Troubleshooting

### Common Issues

1. **Images not showing in previews:**
   - Ensure images are publicly accessible
   - Check that image URLs are absolute (not relative)
   - Verify image format is supported (JPG, PNG)

2. **Meta tags not updating:**
   - Clear browser cache
   - Check that HelmetProvider is properly configured
   - Verify React Helmet is working

3. **WhatsApp preview not working:**
   - Ensure the website is accessible via HTTPS
   - Check that meta tags are properly formatted
   - Test with different WhatsApp versions

### Debug Tools

1. **Facebook Sharing Debugger:**
   - https://developers.facebook.com/tools/debug/
   - Enter your property URL to test Facebook sharing

2. **Twitter Card Validator:**
   - https://cards-dev.twitter.com/validator
   - Test Twitter Card previews

3. **LinkedIn Post Inspector:**
   - https://www.linkedin.com/post-inspector/
   - Test LinkedIn sharing

## Best Practices

1. **Image Optimization:**
   - Use high-quality images (1200x630px minimum)
   - Optimize file sizes for faster loading
   - Use descriptive alt text

2. **Content Optimization:**
   - Keep descriptions under 200 characters
   - Include key property details (price, location, size)
   - Use compelling titles

3. **Testing:**
   - Test on multiple devices and platforms
   - Verify meta tags are generated correctly
   - Check sharing functionality regularly

## Future Enhancements

1. **Analytics Integration:**
   - Track social sharing metrics
   - Monitor which platforms are most popular
   - Analyze sharing patterns

2. **Advanced Features:**
   - QR code generation for property links
   - Custom sharing templates
   - Social media scheduling

3. **Platform Expansion:**
   - Instagram sharing
   - LinkedIn sharing
   - Pinterest integration

## Support

If you encounter issues with social sharing:
1. Check the browser console for errors
2. Verify meta tags are present in the page source
3. Test with the provided test page
4. Use platform-specific debugging tools 