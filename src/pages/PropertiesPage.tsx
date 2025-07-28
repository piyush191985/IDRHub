import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, Grid, List } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { PropertyGrid } from '../components/properties/PropertyGrid';
import { SearchForm } from '../components/search/SearchForm';
import { SearchCriteria } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const PropertiesPage: React.FC = () => {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user } = useAuth();
  // Show all if admin, or agent (to see their own unapproved properties)
  const showAll = user?.role === 'admin' || user?.role === 'agent';
  const { properties, loading } = useProperties(searchCriteria, showAll);

  const handleSearch = (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
  };

  const clearFilters = () => {
    setSearchCriteria({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
              <p className="mt-2 text-gray-600">
                {loading ? 'Loading...' : `${properties.length} properties found`}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white border-b border-gray-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <SearchForm
              onSearch={handleSearch}
              initialCriteria={searchCriteria}
            />
            {Object.keys(searchCriteria).length > 0 && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Properties */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PropertyGrid
          properties={properties}
          loading={loading}
          showUnverifiedBadge={showAll}
        />
      </div>
    </div>
  );
};