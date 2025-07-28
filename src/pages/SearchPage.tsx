import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Filter } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { PropertyGrid } from '../components/properties/PropertyGrid';
import { SearchForm } from '../components/search/SearchForm';
import { SearchCriteria } from '../types';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { properties, loading } = useProperties(searchCriteria);

  useEffect(() => {
    // Parse search params into criteria
    const criteria: SearchCriteria = {};
    
    const location = searchParams.get('location');
    if (location) criteria.location = location;
    
    const minPrice = searchParams.get('min_price');
    if (minPrice) criteria.min_price = parseInt(minPrice);
    
    const maxPrice = searchParams.get('max_price');
    if (maxPrice) criteria.max_price = parseInt(maxPrice);
    
    const bedrooms = searchParams.get('bedrooms');
    if (bedrooms) criteria.bedrooms = parseInt(bedrooms);
    
    const bathrooms = searchParams.get('bathrooms');
    if (bathrooms) criteria.bathrooms = parseInt(bathrooms);
    
    const propertyType = searchParams.get('property_type');
    if (propertyType) criteria.property_type = propertyType;
    
    const minSqft = searchParams.get('min_sqft');
    if (minSqft) criteria.min_sqft = parseInt(minSqft);
    
    const maxSqft = searchParams.get('max_sqft');
    if (maxSqft) criteria.max_sqft = parseInt(maxSqft);

    setSearchCriteria(criteria);
  }, [searchParams]);

  const handleSearch = (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
    
    // Update URL with search params
    const newParams = new URLSearchParams();
    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        newParams.set(key, value.toString());
      }
    });
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    setSearchCriteria({});
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Search Properties
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find your perfect home with our advanced search tools. 
              Filter by location, price, size, and more to discover properties that match your needs.
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchForm
          onSearch={handleSearch}
          initialCriteria={searchCriteria}
          className="mb-8"
        />

        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {loading ? 'Searching...' : `${properties.length} Properties Found`}
            </h2>
            {Object.keys(searchCriteria).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {searchCriteria.location && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    <MapPin className="w-3 h-3 mr-1" />
                    {searchCriteria.location}
                  </span>
                )}
                {searchCriteria.min_price && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Min: ${searchCriteria.min_price.toLocaleString()}
                  </span>
                )}
                {searchCriteria.max_price && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Max: ${searchCriteria.max_price.toLocaleString()}
                  </span>
                )}
                {searchCriteria.property_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    {searchCriteria.property_type}
                  </span>
                )}
                {searchCriteria.bedrooms && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                    {searchCriteria.bedrooms}+ beds
                  </span>
                )}
                {searchCriteria.bathrooms && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                    {searchCriteria.bathrooms}+ baths
                  </span>
                )}
              </div>
            )}
          </div>
          
          {Object.keys(searchCriteria).length > 0 && (
            <button
              onClick={clearSearch}
              className="mt-4 md:mt-0 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Results */}
        <PropertyGrid
          properties={properties}
          loading={loading}
        />
      </div>
    </div>
  );
};