import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'property';
  property?: {
    title?: string;
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    city?: string;
    state?: string;
    images?: string[];
  };
}

export const SEO: React.FC<SEOProps> = ({
  title = 'IDRHub - Professional Real Estate Platform',
  description = 'Discover your dream property with IDRHub. Browse thousands of properties, connect with professional agents, and find your perfect home.',
  image = '/idrhub-og-image.jpg', // Default OG image
  url,
  type = 'website',
  property
}) => {
  // Generate property-specific description if property data is provided
  const getPropertyDescription = () => {
    if (!property) return description;
    
    const details = [];
    if (property.price) details.push(`₹${property.price.toLocaleString()}`);
    // Only include bedrooms and bathrooms if they exist (not for land properties)
    if (property.bedrooms) details.push(`${property.bedrooms} bed`);
    if (property.bathrooms) details.push(`${property.bathrooms} bath`);
    if (property.square_feet) details.push(`${property.square_feet} sq ft`);
    if (property.city && property.state) details.push(`${property.city}, ${property.state}`);
    
    return `${property.title} - ${details.join(' • ')} | IDRHub`;
  };

  // Get the best image for social sharing
  const getSocialImage = () => {
    if (property?.images && property.images.length > 0) {
      // Use the first property image if available
      return property.images[0];
    }
    return image;
  };

  const finalTitle = property ? `${property.title} | IDRHub` : title;
  const finalDescription = getPropertyDescription();
  const finalImage = getSocialImage();
  const finalUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      
      {/* Open Graph Meta Tags (Facebook, WhatsApp, etc.) */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="IDRHub" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:site" content="@idrhub" />
      
      {/* Additional Property-specific Meta Tags */}
      {property && (
        <>
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={property.title} />
          
          {/* Property-specific structured data */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateListing",
              "name": property.title,
              "description": finalDescription,
              "image": property.images,
              "url": finalUrl,
              "price": property.price,
              "priceCurrency": "INR",
              ...(property.bedrooms && { "numberOfBedrooms": property.bedrooms }),
              ...(property.bathrooms && { "numberOfBathroomsTotal": property.bathrooms }),
              "floorSize": {
                "@type": "QuantitativeValue",
                "value": property.square_feet,
                "unitCode": "SQFT"
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": property.city,
                "addressRegion": property.state
              }
            })}
          </script>
        </>
      )}
      
      {/* WhatsApp-specific meta tags */}
      <meta property="og:image:secure_url" content={finalImage} />
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Additional meta tags for better sharing */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="IDRHub" />
      <meta name="keywords" content="real estate, property, homes for sale, IDRHub, real estate platform" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalUrl} />
    </Helmet>
  );
}; 