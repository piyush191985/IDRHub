import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Tour, Property, User as UserType } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatDate, formatPrice } from '../../utils/format';
import toast from 'react-hot-toast';

interface TourWithDetails extends Omit<Tour, 'agent'> {
  property?: Property;
  buyer?: UserType;
  agent?: UserType;
}

export const TourManagement: React.FC = () => {
  const { user } = useAuth();
  const [tours, setTours] = useState<TourWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (user) {
      fetchTours();
    }
  }, [user, filter]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('tours')
        .select(`
          *,
          property:properties(*),
          buyer:users!tours_buyer_id_fkey(*),
          agent:users!tours_agent_id_fkey(*)
        `)
        .eq('agent_id', user?.id);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: true });

      if (error) throw error;
      setTours(data || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast.error('Failed to load tours');
    } finally {
      setLoading(false);
    }
  };

  const updateTourStatus = async (tourId: string, status: 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ status })
        .eq('id', tourId);

      if (error) throw error;

      // Update local state
      setTours(prev => prev.map(tour => 
        tour.id === tourId ? { ...tour, status } : tour
      ));

      toast.success(`Tour ${status} successfully`);
    } catch (error) {
      console.error('Error updating tour status:', error);
      toast.error('Failed to update tour status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const filteredTours = tours.filter(tour => {
    if (filter === 'all') return true;
    return tour.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tour Management</h2>
          <p className="text-gray-600">Manage your scheduled property tours</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'scheduled', label: 'Scheduled' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tours List */}
      <div className="space-y-4">
        {filteredTours.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tours found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any tours scheduled yet."
                : `No ${filter} tours found.`
              }
            </p>
          </div>
        ) : (
          filteredTours.map((tour) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Property Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tour.property?.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{tour.property?.address}, {tour.property?.city}</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {tour.property && formatPrice(tour.property.price)}
                    </div>
                  </div>

                  {/* Tour Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Tour Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{formatDate(tour.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            {new Date(tour.scheduled_date).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })} ({tour.duration} minutes)
                          </span>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(tour.status)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tour.status)}`}>
                            {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Buyer Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Buyer Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{tour.buyer?.full_name}</span>
                        </div>
                        {tour.buyer?.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{tour.buyer.phone}</span>
                          </div>
                        )}
                        {tour.buyer?.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{tour.buyer.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {tour.notes && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {tour.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {tour.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => updateTourStatus(tour.id, 'completed')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Complete</span>
                      </button>
                      <button
                        onClick={() => updateTourStatus(tour.id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      // TODO: Implement messaging functionality
                      toast('Messaging feature coming soon!');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}; 