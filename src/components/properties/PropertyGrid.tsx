import React from 'react';
import { motion } from 'framer-motion';
import { PropertyCard } from './PropertyCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Property } from '../../types';
import { useFavorites } from '../../hooks/useFavorites';

interface PropertyGridProps {
  properties: Property[];
  loading?: boolean;
  onFavoriteToggle?: (propertyId: string) => void;
  favoriteProperties?: string[];
  className?: string;
  showUnverifiedBadge?: boolean;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  loading = false,
  onFavoriteToggle,
  favoriteProperties = [],
  className = '',
  showUnverifiedBadge = false,
}) => {
  const { favorites } = useFavorites();
  
  // Use the favorites from the hook if no favoriteProperties are provided
  const effectiveFavoriteProperties = favoriteProperties.length > 0 
    ? favoriteProperties 
    : favorites.map(p => p.id);

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500 text-lg mb-2">No properties found</div>
        <p className="text-gray-400">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {properties.map((property, index) => (
        <motion.div
          key={property.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PropertyCard
            property={property}
            onFavoriteToggle={onFavoriteToggle}
            isFavorite={effectiveFavoriteProperties.includes(property.id)}
            showUnverifiedBadge={showUnverifiedBadge}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};