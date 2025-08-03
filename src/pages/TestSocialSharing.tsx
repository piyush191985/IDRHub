import React from 'react';
import { SEO } from '../components/common/SEO';
import { SocialShare } from '../components/common/SocialShare';

export const TestSocialSharing: React.FC = () => {
  const testProperty = {
    title: "Beautiful 3BR Apartment in Downtown",
    price: 2500000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1500,
    city: "Mumbai",
    state: "Maharashtra",
    images: ["https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"]
  };

  return (
    <>
      <SEO
        property={testProperty}
        url={window.location.href}
        type="property"
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Social Sharing Test Page</h1>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Property</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium">{testProperty.title}</h3>
                <p className="text-gray-600">₹{testProperty.price.toLocaleString()}</p>
                <p className="text-gray-600">{testProperty.bedrooms} bed • {testProperty.bathrooms} bath • {testProperty.square_feet} sq ft</p>
                <p className="text-gray-600">{testProperty.city}, {testProperty.state}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Share Buttons</h2>
              <SocialShare
                url={window.location.href}
                title={testProperty.title}
                description={`${testProperty.title} - ₹${testProperty.price.toLocaleString()} • ${testProperty.bedrooms} bed • ${testProperty.bathrooms} bath • ${testProperty.square_feet} sq ft • ${testProperty.city}, ${testProperty.state} | IDRHub`}
                image={testProperty.images[0]}
              />
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Meta Tags Preview</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div><strong>Title:</strong> {testProperty.title} | IDRHub</div>
                <div><strong>Description:</strong> {testProperty.title} - ₹{testProperty.price.toLocaleString()} • {testProperty.bedrooms} bed • {testProperty.bathrooms} bath • {testProperty.square_feet} sq ft • {testProperty.city}, {testProperty.state} | IDRHub</div>
                <div><strong>Image:</strong> {testProperty.images[0]}</div>
                <div><strong>URL:</strong> {window.location.href}</div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Testing Instructions</h2>
              <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>1. WhatsApp Test:</strong> Click the WhatsApp button and check if the preview shows correctly</p>
                <p><strong>2. Facebook Test:</strong> Click the Facebook button and check if the preview shows correctly</p>
                <p><strong>3. Twitter Test:</strong> Click the Twitter button and check if the preview shows correctly</p>
                <p><strong>4. Copy Link Test:</strong> Copy the link and paste it in WhatsApp/Facebook to see the preview</p>
                <p><strong>5. Mobile Test:</strong> Test on mobile devices to see native sharing</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Open browser developer tools and check the &lt;head&gt; section to see the generated meta tags.
                  You should see og:title, og:description, og:image, and other social media meta tags.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 