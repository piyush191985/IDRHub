import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Calendar, User, Building, Phone, Mail, MessageSquare, MapPin, Clock, CheckCircle, AlertCircle, XCircle, Edit } from 'lucide-react';

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, property:property_id(title, address, city, state, zip_code, price, bedrooms, bathrooms, square_feet), agent:agent_id(full_name, email, phone)')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          // Check if user has access to this booking
          if (user?.role === 'agent' && data.agent_id !== user.id) {
            throw new Error('Access denied. You can only view your own bookings.');
          }
          setBooking(data);
        } else {
          throw new Error('Booking not found.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const updateBookingStatus = async (newStatus: string) => {
    if (!booking) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', booking.id);
      
      if (error) throw error;
      
      // If booking is being confirmed, create a transaction record
      if (newStatus === 'confirmed' && booking.status !== 'confirmed') {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              property_id: booking.property_id,
              agent_id: booking.agent_id,
              buyer_id: null, // We don't have buyer_id in bookings, so use null
              seller_id: booking.agent_id, // Agent is the seller
              price: booking.property?.price || 0,
              status: 'in_progress', // Use 'in_progress' instead of 'confirmed'
              offer_date: new Date().toISOString(),
              contract_date: new Date().toISOString(),
              closing_date: new Date().toISOString(),
            }
          ]);
        
        if (transactionError) {
          console.error('Error creating transaction record:', transactionError);
          // Don't throw error here as the booking status was already updated
        }
      }
      
      setBooking((prev: any) => ({ ...prev, status: newStatus }));
      
      // Show success message
      alert(`Booking status updated to ${newStatus}!`);
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                  <p className="text-gray-600">ID: {booking.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                  <span className="ml-2">{booking.status.toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Agent-only contact information */}
          {user?.role === 'agent' && booking && (
            <div className="px-8 py-4 bg-blue-50 border-b border-blue-200">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">Customer Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-900 mb-2">Customer Details:</div>
                  <div className="space-y-1 text-blue-800">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span>{booking.customer_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{booking.customer_email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{booking.customer_phone}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-blue-900 mb-2">Property Details:</div>
                  <div className="space-y-1 text-blue-800">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2" />
                      <span>{booking.property?.title || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{booking.property?.address || 'N/A'}</span>
                    </div>
                    {booking.property?.price && (
                      <div className="flex items-center">
                        <span className="font-medium">{formatPrice(booking.property.price)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-8 py-6">
            <div className="space-y-6">
              {/* Property Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Title</span>
                    <p className="text-gray-900">{booking.property?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Address</span>
                    <p className="text-gray-900">{booking.property?.address || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Location</span>
                    <p className="text-gray-900">
                      {booking.property?.city}, {booking.property?.state} {booking.property?.zip_code}
                    </p>
                  </div>
                  {booking.property?.price && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Price</span>
                      <p className="text-gray-900 font-semibold">{formatPrice(booking.property.price)}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Bedrooms</span>
                    <p className="text-gray-900">{booking.property?.bedrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Bathrooms</span>
                    <p className="text-gray-900">{booking.property?.bathrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Square Feet</span>
                    <p className="text-gray-900">{booking.property?.square_feet || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Customer Name</span>
                    <p className="text-gray-900">{booking.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Customer Email</span>
                    <p className="text-gray-900">{booking.customer_email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Customer Phone</span>
                    <p className="text-gray-900">{booking.customer_phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Agent</span>
                    <p className="text-gray-900">{booking.agent?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <p className="text-gray-900">{booking.status.toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created</span>
                    <p className="text-gray-900">{formatDate(booking.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {booking.message && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Message</h3>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-gray-700">{booking.message}</p>
                  </div>
                </div>
              )}

              {/* Status Management */}
              {user?.role === 'agent' && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
                  <div className="flex flex-wrap gap-3">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus('confirmed')}
                          disabled={updating}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {updating ? 'Updating...' : 'Confirm Booking'}
                        </button>
                        <button
                          onClick={() => updateBookingStatus('cancelled')}
                          disabled={updating}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {updating ? 'Updating...' : 'Cancel Booking'}
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus('completed')}
                        disabled={updating}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {updating ? 'Updating...' : 'Mark as Completed'}
                      </button>
                    )}
                    
                    {booking.status === 'completed' && (
                      <div className="text-green-600 font-medium">
                        ✓ This booking has been completed
                      </div>
                    )}
                    
                    {booking.status === 'cancelled' && (
                      <div className="text-red-600 font-medium">
                        ✗ This booking has been cancelled
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage; 