import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Eye,
  Star,
  Calendar
} from 'lucide-react';
import { Property } from '../../types';
import { formatPrice, formatDate } from '../../utils/format';
import { getFileUrl } from '../../utils/fileUpload';
import { UserAvatar } from '../common/UserAvatar';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: (propertyId: string) => void;
  isFavorite?: boolean;
  className?: string;
  showUnverifiedBadge?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onFavoriteToggle,
  isFavorite = false,
  className = '',
  showUnverifiedBadge = false,
}) => {
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite: isPropertyFavorite } = useFavorites();
  const [viewCounted, setViewCounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use the hook's isFavorite function if no prop is provided
  const favoriteStatus = isFavorite !== undefined ? isFavorite : isPropertyFavorite(property.id);

  // Track when card comes into view
  useEffect(() => {
    if (!user || viewCounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !viewCounted) {
            // Card is visible, record view
            recordPropertyView();
            setViewCounted(true);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of card is visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [user, viewCounted]);

  const recordPropertyView = async () => {
    if (!user) return;
    
    try {
      // Use card view tracking (no count increment, just analytics)
      const { error } = await supabase
        .rpc('record_card_view', { property_id: property.id });

      if (error) {
        console.error('Error recording card view:', error);
      }
    } catch (err) {
      console.error('Error recording card view:', err);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      if (favoriteStatus) {
        await removeFromFavorites(property.id);
        toast.success('Removed from favorites');
      } else {
        await addToFavorites(property.id);
        toast.success('Added to favorites');
      }
      
      // Call the parent's onFavoriteToggle if provided
      onFavoriteToggle?.(property.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1] || url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('instagram.com') && url.includes('reel')) {
      const videoId = url.split('/').pop();
      return `https://www.instagram.com/p/${videoId}/embed`;
    }
    return url; // Fallback for other URLs
  };

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}
    >
      <Link to={`/properties/${property.id}`}>
        <div className="relative">
          <img
            src={getFileUrl(property.images[0] || '') || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              property.status === 'available' 
                ? 'bg-green-100 text-green-800'
                : property.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {property.status.toUpperCase()}
            </span>
            {showUnverifiedBadge && property.is_approved === false && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                Unverified
              </span>
            )}
          </div>

          {/* Featured Badge */}
          {property.is_featured && (
            <div className="absolute top-3 right-14">
              <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>Featured</span>
              </span>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              favoriteStatus
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${favoriteStatus ? 'fill-current' : ''}`} />
          </button>

          {/* View Count */}
          {property.view_count && property.view_count > 0 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{property.view_count}</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Price */}
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {formatPrice(property.price)}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center space-x-1 text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{property.city}, {property.state}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            {property.bedrooms > 0 && (
              <div className="flex items-center space-x-1">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms} bed</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center space-x-1">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms} bath</span>
              </div>
            )}
            {property.square_feet && property.square_feet > 0 && (
              <div className="flex items-center space-x-1">
                <Square className="w-4 h-4" />
                <span>{property.square_feet.toLocaleString()} sqft</span>
              </div>
            )}
          </div>

          {/* Agent Info */}
          {property.agent && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <UserAvatar user={property.agent} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {property.agent.full_name}
                  </p>
                  {property.agent.rating && property.agent.rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">{property.agent.rating}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(property.created_at)}</span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};