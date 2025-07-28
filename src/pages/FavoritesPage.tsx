import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, Eye, Calendar } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { PropertyGrid } from '../components/properties/PropertyGrid';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

export const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const { favorites, loading, error, removeFromFavorites } = useFavorites();

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      await removeFromFavorites(propertyId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your favorite properties</p>
          <Link
            to="/signin"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Favorites</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate average price
  const avgPrice = favorites.length > 0 
    ? Math.round(favorites.reduce((sum, prop) => sum + prop.price, 0) / favorites.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600">
                {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Favorites Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring properties and save your favorites by clicking the heart icon on any property listing.
            </p>
            <Link
              to="/properties"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>Browse Properties</span>
            </Link>
          </motion.div>
        ) : (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <Heart className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                    <p className="text-gray-600">Saved Properties</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(avgPrice)}
                    </p>
                    <p className="text-gray-600">Avg. Price</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <Eye className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(favorites.reduce((sum, prop) => sum + prop.view_count, 0) / favorites.length)}
                    </p>
                    <p className="text-gray-600">Avg. Views</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Properties Grid */}
            <PropertyGrid
              properties={favorites}
              onFavoriteToggle={handleRemoveFavorite}
              favoriteProperties={favorites.map(p => p.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};