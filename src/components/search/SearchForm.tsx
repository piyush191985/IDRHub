import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Home, Bed, Bath, Square, IndianRupee } from 'lucide-react';
import { SearchCriteria } from '../../types';

interface SearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  initialCriteria?: SearchCriteria;
  className?: string;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  initialCriteria = {},
  className = '',
}) => {
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(criteria);
  };

  const handleInputChange = (field: keyof SearchCriteria, value: any) => {
    setCriteria(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="City, State, or ZIP"
              value={criteria.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range (₹)
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="Min"
                value={criteria.min_price || ''}
                onChange={(e) => handleInputChange('min_price', parseInt(e.target.value) || undefined)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative flex-1">
              <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="Max"
                value={criteria.max_price || ''}
                onChange={(e) => handleInputChange('max_price', parseInt(e.target.value) || undefined)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <div className="relative">
            <Home className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <select
              value={criteria.property_type || ''}
              onChange={(e) => handleInputChange('property_type', e.target.value || undefined)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">All Types</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="apartment">Apartment</option>
              <option value="townhouse">Townhouse</option>
              <option value="land">Land</option>
            </select>
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bedrooms
          </label>
          <div className="relative">
            <Bed className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <select
              value={criteria.bedrooms || ''}
              onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || undefined)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bathrooms
          </label>
          <div className="relative">
            <Bath className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <select
              value={criteria.bathrooms || ''}
              onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || undefined)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>

        {/* Square Footage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Square Footage
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Square className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="Min"
                value={criteria.min_sqft || ''}
                onChange={(e) => handleInputChange('min_sqft', parseInt(e.target.value) || undefined)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative flex-1">
              <Square className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="Max"
                value={criteria.max_sqft || ''}
                onChange={(e) => handleInputChange('max_sqft', parseInt(e.target.value) || undefined)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Search Properties</span>
        </button>
      </div>
    </motion.form>
  );
};