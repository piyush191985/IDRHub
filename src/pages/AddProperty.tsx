import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Home, MapPin, Camera, Eye, Upload, Video, Check, X, IndianRupee, Bed, Bath, Square, Car, Calendar } from 'lucide-react';
import { uploadFileLocally, getFileUrl } from '../utils/fileUpload';
import { useProperties } from '../hooks/useProperties';
import { useAuth } from '../contexts/AuthContext';

const allowedPropertyTypes = ['house', 'condo', 'apartment', 'townhouse', 'land', 'villa','farmhouse','Duplex','Studio','Bunglow','Penthouse'] as const;
type AllowedPropertyType = typeof allowedPropertyTypes[number];

const allowedStatusTypes = ['available', 'pending', 'sold'] as const;
type AllowedStatusType = typeof allowedStatusTypes[number];

interface PropertyData {
  title: string;
  description: string;
  property_type: AllowedPropertyType | '';
  price: string;
  bedrooms: string;
  bathrooms: string;
  square_feet: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  images: string[];
  virtual_tour_url: string;
  features: string[]; // <-- add this
  year_built: string; // <-- add this (as string for input, convert to number on submit)
}

const AddProperty: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    title: '',
    description: '',
    property_type: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    images: [],
    virtual_tour_url: '',
    features: [], // <-- add this
    year_built: '', // <-- add this
  });
  const { addProperty } = useProperties();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: keyof PropertyData, value: string | string[]) => {
    setPropertyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      try {
        // Validate file types and sizes before uploading
        for (const file of newFiles) {
          if (!file.type.startsWith('image/')) {
            alert('Please select only image files (JPEG, PNG, etc.)');
            return;
          }
          if (file.size > 1 * 1024 * 1024) { // 1MB limit per file
            alert('File size too large. Please select images smaller than 1MB each.');
            return;
          }
        }
        
        const uploadPromises = newFiles.map(file => uploadFileLocally(file, 'properties'));
        const uploadedPaths = await Promise.all(uploadPromises);
        setPropertyData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedPaths]
        }));
      } catch (error) {
        console.error('Photo upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to upload photos: ${errorMessage}. Please try again with smaller images.`);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPropertyData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      // Parse price properly - remove commas and convert to number
      const cleanPrice = propertyData.price.replace(/,/g, '');
      const parsedPrice = Number(cleanPrice);
      
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        alert('Please enter a valid price');
        setSubmitting(false);
        return;
      }

      const propertyToInsert = {
        title: propertyData.title,
        description: propertyData.description,
        property_type: propertyData.property_type as AllowedPropertyType,
        price: parsedPrice,
        bedrooms: Number(propertyData.bedrooms),
        bathrooms: Number(propertyData.bathrooms), // Convert to number
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state,
        zip_code: propertyData.zip_code,
        images: propertyData.images, // This should be a string array
        virtual_tour_url: propertyData.virtual_tour_url || undefined,
        agent_id: user.id,
        is_approved: false,
        status: 'available' as AllowedStatusType,
        features: propertyData.features,
        year_built: propertyData.year_built ? Number(propertyData.year_built) : undefined,
        square_feet: Number(propertyData.square_feet),
        view_count: 0,
        is_featured: false,
      };
      
      console.log('Submitting property data:', propertyToInsert);
      await addProperty(propertyToInsert);
      alert('Property submitted successfully! It will be reviewed by admin before going live.');
      // Optionally reset form or redirect
    } catch (err) {
      console.error('Property submission error:', err);
      alert('Failed to submit property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeaturesChange = (value: string) => {
    setPropertyData(prev => ({
      ...prev,
      features: value.split(',').map(f => f.trim()).filter(f => f.length > 0)
    }));
  };

  // Add a list of common features for quick-add
  const commonFeatures = [
    'Pool', 'Garage', 'Garden', 'Fireplace', 'Balcony', 'Gym', 'Security', 'Elevator', 'Pet Friendly', 'Furnished', 'Playground', 'Basement', 'Solar Panels', 'Smart Home'
  ];

  // Add handler for adding a feature
  const [featureInput, setFeatureInput] = useState('');
  const addFeature = (feature: string) => {
    const trimmed = feature.trim();
    if (trimmed && !propertyData.features.includes(trimmed)) {
      setPropertyData(prev => ({
        ...prev,
        features: [...prev.features, trimmed]
      }));
    }
    setFeatureInput('');
  };
  const removeFeature = (feature: string) => {
    setPropertyData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };
  const handleFeatureInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature(featureInput);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return propertyData.title && propertyData.property_type && propertyData.price && propertyData.bedrooms && propertyData.bathrooms && propertyData.square_feet && propertyData.year_built && propertyData.features.length > 0;
      case 2:
        return propertyData.address && propertyData.city && propertyData.state && propertyData.zip_code;
      case 3:
        return propertyData.images.length > 0;
      default:
        return true;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
            step <= currentStep 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'border-gray-300 text-gray-400'
          }`}>
            {step < currentStep ? <Check className="w-5 h-5" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-0.5 transition-all duration-300 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Home className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
        <p className="text-gray-600">Tell us about your property</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
          <input
            type="text"
            value={propertyData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Beautiful 3BR Apartment in Downtown"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
          <select
            value={propertyData.property_type}
            onChange={(e) => handleInputChange('property_type', e.target.value as AllowedPropertyType)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Select Type</option>
            {allowedPropertyTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={propertyData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="25,00,000"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
          <div className="relative">
            <Bed className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <select
              value={propertyData.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select</option>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
          <div className="relative">
            <Bath className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <select
              value={propertyData.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select</option>
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Square Feet</label>
          <div className="relative">
            <Square className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={propertyData.square_feet}
              onChange={(e) => handleInputChange('square_feet', e.target.value)}
              placeholder="1500"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year Built</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-blue-400" />
            <input
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              value={propertyData.year_built}
              onChange={e => handleInputChange('year_built', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-blue-200 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-blue-300"
              placeholder="e.g. 2005"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Features</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {propertyData.features.map((feature) => (
              <span key={feature} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                {feature}
                <button
                  type="button"
                  className="ml-2 text-blue-500 hover:text-red-500 focus:outline-none"
                  onClick={() => removeFeature(feature)}
                  aria-label={`Remove ${feature}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mb-2 flex-wrap">
            {commonFeatures.map((feature) => (
              <button
                key={feature}
                type="button"
                className={`px-2 py-1 rounded-full border text-xs font-medium transition-colors ${propertyData.features.includes(feature) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`}
                onClick={() => addFeature(feature)}
                disabled={propertyData.features.includes(feature)}
              >
                {feature}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={featureInput}
              onChange={e => setFeatureInput(e.target.value)}
              onKeyDown={handleFeatureInputKeyDown}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Add a custom feature and press Enter"
            />
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              onClick={() => addFeature(featureInput)}
              disabled={!featureInput.trim()}
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Click a quick feature or add your own. Click 'X' to remove.</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={propertyData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            placeholder="Describe your property..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
        <p className="text-gray-600">Where is your property located?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
          <input
            type="text"
            value={propertyData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="123 Main Street"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={propertyData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="New York"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <input
            type="text"
            value={propertyData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="NY"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
          <input
            type="text"
            value={propertyData.zip_code}
            onChange={(e) => handleInputChange('zip_code', e.target.value)}
            placeholder="10001"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Camera className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Media Upload</h2>
        <p className="text-gray-600">Add photos and videos to showcase your property</p>
      </div>

      <div className="space-y-8">
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">Property Photos</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Drag and drop photos here, or click to browse</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
            >
              <Upload className="w-5 h-5 mr-2" />
              Choose Photos
            </label>
          </div>

          {/* Photo Preview */}
          {propertyData.images.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Photos ({propertyData.images.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {propertyData.images.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getFileUrl(photo)}
                      alt={`Property ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        console.error('Image failed to load:', photo);
                        e.currentTarget.src = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800';
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', photo);
                      }}
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="virtual_tour_url" className="block text-sm font-medium text-gray-700 mb-2">Video Tour URL (YouTube or Instagram Reel)</label>
          <input
            type="url"
            id="virtual_tour_url"
            value={propertyData.virtual_tour_url}
            onChange={e => handleInputChange('virtual_tour_url', e.target.value)}
            placeholder="https://youtube.com/... or https://instagram.com/reel/..."
            pattern="https://(www\.)?(youtube\.com|youtu\.be|instagram\.com/reel)/.+"
            required={false}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <small className="text-gray-500">Paste a YouTube or Instagram Reel link for a video tour (optional).</small>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
        <p className="text-gray-600">Please review your property details before submitting</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        {/* Basic Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Title:</span> {propertyData.title}</div>
            <div><span className="font-medium">Type:</span> {propertyData.property_type}</div>
            <div><span className="font-medium">Price:</span> ₹{propertyData.price}</div>
            <div><span className="font-medium">Bedrooms:</span> {propertyData.bedrooms}</div>
            <div><span className="font-medium">Bathrooms:</span> {propertyData.bathrooms}</div>
            <div><span className="font-medium">Description:</span> {propertyData.description}</div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
          <div className="text-sm space-y-1">
            <div>{propertyData.address}</div>
            <div>{propertyData.city}, {propertyData.state} {propertyData.zip_code}</div>
          </div>
        </div>

        {/* Media */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Media</h3>
          <div className="space-y-4">
            <div>
              <span className="font-medium">Photos:</span> {propertyData.images.length} uploaded
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Check className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">Ready to Submit</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your property will be submitted for admin review and will appear on the properties page once approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
            <p className="text-gray-600 mt-2">Step {currentStep} of 4</p>
          </div>

          <div className="px-8 py-8">
            {renderStepIndicator()}

            <div className="max-w-3xl mx-auto">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={`flex items-center px-8 py-3 rounded-lg transition-all duration-200 ${
                    isStepValid()
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {submitting ? 'Submitting...' : 'Submit Property'}
                  <Check className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;