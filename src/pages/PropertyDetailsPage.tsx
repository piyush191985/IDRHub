import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  Star,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  
  Building,
 
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import { formatPrice, formatDate } from '../utils/format';
import { getFileUrl } from '../utils/fileUpload';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useMessages } from '../hooks/useMessages';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { TourScheduler } from '../components/tours/TourScheduler';
import { CurrencyConverter } from '../components/common/CurrencyConverter';
import { ReviewForm } from '../components/common/ReviewForm';
import toast from 'react-hot-toast';
import BookingModal from '../components/common/BookingModal';
import { UserAvatar } from '../components/common/UserAvatar';
import { SEO } from '../components/common/SEO';
import { SocialShare } from '../components/common/SocialShare';

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { sendPropertyInquiry } = useMessages();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showTourScheduler, setShowTourScheduler] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const viewCountedRef = useRef(false);
 

  useEffect(() => {
    if (id) {
      fetchProperty();
      // Only increment view count once when component mounts and user is logged in
      if (user && !viewCountedRef.current) {
        console.log('👤 User logged in, incrementing view count');
        incrementViewCount();
        viewCountedRef.current = true;
      } else if (!user) {
        console.log('👤 No user logged in, skipping view count');
      } else if (viewCountedRef.current) {
        console.log('👤 View already counted, skipping');
      }
    }
  }, [id, user]); // Remove viewCounted from dependencies

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('properties')
        .select(`
          *,
          agent:users!properties_agent_id_fkey(*)
        `)
        .eq('id', id);

      // Apply approval filter based on user role
      if (user?.role === 'admin') {
        // Admin can see all properties (no filter needed)
      } else if (user?.role === 'agent') {
        // Agent can see approved properties and their own unapproved ones
        query = query.or(`is_approved.eq.true,agent_id.eq.${user.id}`);
      } else {
        // Regular users can only see approved properties
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching property:', error);
        setError('Property not found or not available.');
        return;
      }

      setProperty(data);
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property details.');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Attempting to increment view count for property:', id);
      
      // Use the combined function that handles both view count increment and detailed tracking
      const { data, error } = await supabase
        .rpc('record_property_view_with_count', { property_id: id });

      if (error) {
        console.error('❌ Error recording property view:', error);
      } else {
        console.log('✅ View count incremented successfully');
      }
    } catch (err) {
      console.error('❌ Error recording property view:', err);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      if (isFavorite(property!.id)) {
        await removeFromFavorites(property!.id);
        toast.success('Removed from favorites');
      } else {
        await addToFavorites(property!.id);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const sendInquiry = async () => {
    if (!user) {
      toast.error('Please sign in to send inquiries');
      return;
    }

    if (!inquiryMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!property?.agent) {
      toast.error('Agent information not available');
      return;
    }

    try {
      setSendingInquiry(true);

      await sendPropertyInquiry(property.id, property.agent.id, inquiryMessage.trim());

      toast.success('Inquiry sent successfully!');
      setInquiryMessage('');
      setShowInquiryForm(false);
      setShowInquiryModal(false);
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast.error('Failed to send inquiry');
    } finally {
      setSendingInquiry(false);
    }
  };

  const shareProperty = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: property?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };



  const nextImage = () => {
    if (property?.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Helper to get embed URL for video
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    try {
      // YouTube URL handling
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        
        // Handle different YouTube URL formats
        if (url.includes('youtube.com/watch')) {
          const urlObj = new URL(url);
          videoId = urlObj.searchParams.get('v') || '';
        } else if (url.includes('youtube.com/embed/')) {
          videoId = url.split('/embed/')[1]?.split('?')[0] || '';
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split(/[?&]/)[0] || '';
        } else if (url.includes('youtube.com/v/')) {
          videoId = url.split('/v/')[1]?.split(/[?&]/)[0] || '';
        } else if (url.includes('youtube.com/shorts/')) {
          videoId = url.split('/shorts/')[1]?.split(/[?&]/)[0] || '';
        }
        
        // Additional fallback for any YouTube URL with video ID pattern
        if (!videoId) {
          const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
          videoId = videoIdMatch ? videoIdMatch[1] : '';
        }
        
        if (!videoId) {
          console.error('Could not extract video ID from URL:', url);
          return '';
        }
        
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`;
      } 
      // Instagram Reel URL handling
      else if (url.includes('instagram.com') && (url.includes('reel') || url.includes('p/'))) {
        let postId = '';
        
        if (url.includes('/reel/')) {
          const parts = url.split('/reel/');
          postId = parts[1]?.split(/[?&]/)[0] || '';
        } else if (url.includes('/p/')) {
          const parts = url.split('/p/');
          postId = parts[1]?.split(/[?&]/)[0] || '';
        }
        
        if (!postId) {
          console.error('Could not extract post ID from Instagram URL:', url);
          return '';
        }
        
        return `https://www.instagram.com/p/${postId}/embed`;
      }
      
      // If it's already an embed URL, return as is
      if (url.includes('/embed')) {
        return url;
      }
      
      console.warn('Unsupported video URL format:', url);
      return '';
    } catch (error) {
      console.error('Error processing video URL:', error);
      return '';
    }
  };

  // Compose gallery items: images + video (if present)
  const galleryItems = property && property.virtual_tour_url
    ? [...(property.images || []), property.virtual_tour_url]
    : property?.images || [];
  const isVideoIndex = property && property.virtual_tour_url && currentImageIndex === galleryItems.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags for Social Sharing */}
      {property && (
        <SEO
          property={{
            title: property.title,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            square_feet: property.square_feet,
            city: property.city,
            state: property.state,
            images: property.images
          }}
          url={window.location.href}
          type="property"
        />
      )}
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleFavoriteToggle}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite(property.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(property.id) ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={shareProperty}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                {isVideoIndex ? (
                  <div className="w-full h-96 flex items-center justify-center bg-black">
                    {(() => {
                      const embedUrl = getEmbedUrl(property!.virtual_tour_url!);
                      console.log('Original URL:', property!.virtual_tour_url);
                      console.log('Embed URL:', embedUrl);
                      
                      if (embedUrl) {
                        return (
                          <iframe
                            src={embedUrl}
                            title="Video Tour"
                            className="w-full h-full rounded-lg border"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            frameBorder="0"
                            onError={(e) => {
                              console.error('Video embed error:', e);
                            }}
                            onLoad={() => {
                              console.log('Video iframe loaded successfully');
                            }}
                          />
                        );
                      } else {
                        return (
                          <div className="text-white text-center p-8">
                            <div className="mb-4">
                              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-lg font-medium">Video not available</p>
                            <p className="text-sm text-gray-400 mt-2">Unable to load video</p>
                            <p className="text-xs text-gray-500 mt-1">URL: {property!.virtual_tour_url}</p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                ) : (
                  <img
                    src={getFileUrl(galleryItems[currentImageIndex] || '') || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={property?.title}
                    className="w-full h-96 object-cover"
                  />
                )}
                {/* Image Navigation */}
                {galleryItems.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </button>
                  </>
                )}
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.status === 'available' 
                      ? 'bg-green-100 text-green-800'
                      : property.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {property.status.toUpperCase()}
                  </span>
                </div>
                {/* View Count */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{property.view_count}</span>
                </div>
              </div>
              {/* Thumbnails */}
              {galleryItems.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {galleryItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {property && property.virtual_tour_url && index === galleryItems.length - 1 ? (
                        <div className="w-full h-full bg-black flex items-center justify-center relative">
                          <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                          <span className="text-xs text-white absolute bottom-1 left-1 right-1 text-center bg-black/60 rounded">Video</span>
                        </div>
                      ) : (
                        <img
                          src={getFileUrl(item) || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={`${property?.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{property.address}, {property.city}, {property.state} {property.zip_code}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{formatPrice(property.price)}</div>
                  <div className="text-sm text-gray-500">Listed {formatDate(property.created_at)}</div>
                  <div className="mt-2">
                    <CurrencyConverter amount={property.price} />
                  </div>
                </div>
              </div>

              <div className={`grid gap-4 mb-6 ${property.property_type === 'land' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                {property.property_type !== 'land' && (
                  <>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Bed className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                      <div className="text-lg font-semibold text-gray-900">{property.bedrooms || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Bedrooms</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Bath className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                      <div className="text-lg font-semibold text-gray-900">{property.bathrooms || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Bathrooms</div>
                    </div>
                  </>
                )}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Square className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900">{property.square_feet?.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Building className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900 capitalize">{property.property_type}</div>
                  <div className="text-sm text-gray-600">Type</div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Sharing */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Share This Property</h3>
                <SocialShare
                  url={window.location.href}
                  title={property.title}
                  description={property.property_type === 'land' 
                    ? `${property.title} - ₹${property.price.toLocaleString()} • ${property.square_feet} sq ft • ${property.city}, ${property.state} | IDRHub`
                    : `${property.title} - ₹${property.price.toLocaleString()} • ${property.bedrooms || 0} bed • ${property.bathrooms || 0} bath • ${property.square_feet} sq ft • ${property.city}, ${property.state} | IDRHub`
                  }
                  image={property.images && property.images.length > 0 ? property.images[0] : undefined}
                  className="justify-start"
                />
              </div>

            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            {property.agent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <UserAvatar user={property.agent} size="xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{property.agent.full_name}</h3>
                    <p className="text-gray-600 capitalize">{property.agent.role}</p>
                    {property.agent.rating && (
                      <div className="flex items-center space-x-1 mt-1">
                        {renderStars(property.agent.rating)}
                        <span className="text-sm text-gray-600">({property.agent.rating})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setShowTourScheduler(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 px-4 rounded-xl font-bold hover:from-green-700 hover:to-green-500 transition-all flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Schedule Tour</span>
                  </button>
                  <button
                    onClick={() => setShowInquiryForm(!showInquiryForm)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 px-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-500 transition-all flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>I'm Interested</span>
                  </button>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white py-3 px-4 rounded-xl font-bold hover:from-purple-700 hover:to-purple-500 transition-all flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Book Property</span>
                  </button>
                  {property.agent.phone && (
                    <a
                      href={`tel:${property.agent.phone}`}
                      className="w-full block bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center"
                    >
                      <Phone className="w-5 h-5 inline-block mr-2" />
                      Call Agent
                    </a>
                  )}
                  {property.agent.email && (
                    <a
                      href={`mailto:${property.agent.email}`}
                      className="w-full block bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center"
                    >
                      <Mail className="w-5 h-5 inline-block mr-2" />
                      Email Agent
                    </a>
                  )}
                  {user && user.id !== property.agent.id && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full block bg-yellow-100 text-yellow-700 py-3 px-4 rounded-xl font-medium hover:bg-yellow-200 transition-colors text-center flex items-center justify-center space-x-2"
                    >
                      <Star className="w-5 h-5" />
                      <span>Review Agent</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Inquiry Form */}
            <AnimatePresence>
              {showInquiryForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">Send Inquiry</h3>
                  <textarea
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Hi, I'm interested in this property. Please contact me to discuss details."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={sendInquiry}
                      disabled={sendingInquiry || !inquiryMessage.trim()}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {sendingInquiry ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowInquiryForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {showInquiryModal && (
          <Modal onClose={() => setShowInquiryModal(false)}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Send Inquiry</h2>
              <div className="mb-2 text-gray-700">
                <strong>Property:</strong> {property.title}
              </div>
              <div className="mb-2 text-gray-700">
                <strong>Agent:</strong> {property.agent?.full_name}
              </div>
              <div className="mb-2 text-gray-700">
                <strong>Your Name:</strong> {user?.full_name}
              </div>
              <div className="mb-2 text-gray-700">
                <strong>Your Email:</strong> {user?.email}
              </div>
              <textarea
                value={inquiryMessage}
                onChange={e => setInquiryMessage(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                placeholder="Tell the agent about your interest in this property..."
              />
              <button
                onClick={sendInquiry}
                disabled={sendingInquiry || !inquiryMessage.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingInquiry ? 'Sending...' : 'Send Inquiry'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Tour Scheduler */}
      <AnimatePresence>
        {showTourScheduler && property.agent && (
          <TourScheduler
            property={property}
            agent={property.agent}
            onClose={() => setShowTourScheduler(false)}
          />
        )}
      </AnimatePresence>

      {/* Review Form */}
      {showReviewForm && property.agent && (
        <ReviewForm
          agentId={property.agent.id}
          propertyId={property.id}
          onClose={() => setShowReviewForm(false)}
          onReviewSubmitted={() => {
            setShowReviewForm(false);
            toast.success('Review submitted successfully!');
          }}
        />
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        <BookingModal
          open={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          property={property}
          user={user}
          onSuccess={() => toast.success('Booking request sent! The agent will contact you soon.')}
          onError={() => toast.error('Failed to send booking request. Please try again.')}
        />
      </AnimatePresence>
    </div>
    </>
  );
};

export default PropertyDetailsPage;