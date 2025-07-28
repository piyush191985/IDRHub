import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Star,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  MessageCircle,
  Shield,
  Users,
  Building,
  CheckCircle,
  Clock,
  IndianRupee
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Agent, Property } from '../types';
import { formatDate, formatPrice } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { PropertyCard } from '../components/properties/PropertyCard';
import { UserAvatar } from '../components/common/UserAvatar';
import { ReviewForm } from '../components/common/ReviewForm';
import toast from 'react-hot-toast';

const AgentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'properties' | 'reviews' | 'about'>('properties');
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAgentDetails();
    }
  }, [id]);

  const fetchAgentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch agent user data and agent profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('role', 'agent')
        .single();

      if (userError || !userData) {
        setError('Agent not found.');
        return;
      }

      // Fetch agent profile data
      const { data: agentProfile, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      // Transform the data to match our Agent type
      const agentData = {
        ...userData,
        ...agentProfile,
        verified: agentProfile?.verified || false,
        rating: agentProfile?.rating || 0,
        total_sales: agentProfile?.total_sales || 0,
        experience_years: agentProfile?.experience_years || 0,
        specializations: agentProfile?.specializations || [],
        bio: agentProfile?.bio || '',
        license_number: agentProfile?.license_number || '',
        commission_rate: agentProfile?.commission_rate || 2.5,
      };

      console.log('User Data:', userData);
      console.log('Agent Profile:', agentProfile);
      console.log('Combined Agent Data:', agentData);

      setAgent(agentData);

      // Fetch agent's properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select(`
          *,
          agent:users!properties_agent_id_fkey(*)
        `)
        .eq('agent_id', id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      setProperties(propertiesData || []);

      // Fetch agent reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:users!reviews_reviewer_id_fkey(*),
          property:properties(title)
        `)
        .eq('agent_id', id)
        .order('created_at', { ascending: false });

      setReviews(reviewsData || []);

    } catch (err) {
      console.error('Error fetching agent details:', err);
      setError('Failed to load agent details.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user) {
      toast.error('Please sign in to send messages');
      return;
    }

    if (!messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!agent) {
      toast.error('Agent information not available');
      return;
    }

    try {
      setSendingMessage(true);

      const conversationId = crypto.randomUUID();

      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: user.id,
            recipient_id: agent.id,
            content: messageText.trim()
          }
        ]);

      if (error) throw error;

      toast.success('Message sent successfully!');
      setMessageText('');
      setShowMessageForm(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The agent you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/agents')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Agents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Agent Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8"
          >
            {/* Avatar */}
            <div className="relative">
              <div className={`w-32 h-32 ${agent.avatar_url ? 'bg-white' : 'bg-white/20 backdrop-blur-sm'} rounded-full flex items-center justify-center border-4 border-white/30`}>
                <UserAvatar user={agent} size={agent.avatar_url ? "4xl" : "xl"} className={agent.avatar_url ? "bg-white" : "text-white bg-transparent"} />
              </div>
              {agent.verified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Agent Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                <h1 className="text-3xl font-bold">{agent.full_name}</h1>
                {agent.verified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mt-2 md:mt-0">
                    <Shield className="w-4 h-4 mr-1" />
                    Verified Agent
                  </span>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:space-x-6 text-blue-100 mb-4">
                <div className="flex items-center justify-center md:justify-start space-x-1 mb-2 md:mb-0">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{agent.rating || 0} rating</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-1 mb-2 md:mb-0">
                  <TrendingUp className="w-4 h-4" />
                  <span>{agent.experience_years || 0} years experience</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-1">
                  <Building className="w-4 h-4" />
                  <span>{agent.total_sales || 0} sales</span>
                </div>
              </div>

              {agent.specializations && agent.specializations.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                  {agent.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}

              {/* Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button
                  onClick={() => setShowMessageForm(!showMessageForm)}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
                
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                )}
                
                <a
                  href={`mailto:${agent.email}`}
                  className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
                
                {user && user.id !== agent.id && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Star className="w-4 h-4" />
                    <span>Leave Review</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Message Form */}
          {showMessageForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Send a Message</h3>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Hi, I'm interested in working with you. Please contact me to discuss my real estate needs."
                rows={4}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none"
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={sendMessage}
                  disabled={sendingMessage || !messageText.trim()}
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {sendingMessage ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowMessageForm(false)}
                  className="border border-white/30 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'properties', label: 'Properties', count: properties.length },
                    { id: 'reviews', label: 'Reviews', count: reviews.length },
                    { id: 'about', label: 'About' }
                  ].map(({ id, label, count }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {label} {count !== undefined && `(${count})`}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Properties Tab */}
                {activeTab === 'properties' && (
                  <div>
                    {properties.length === 0 ? (
                      <div className="text-center py-12">
                        <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Listed</h3>
                        <p className="text-gray-500">This agent hasn't listed any properties yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {properties.map((property) => (
                          <PropertyCard
                            key={property.id}
                            property={property}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    {reviews.length === 0 ? (
                      <div className="text-center py-12">
                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                        <p className="text-gray-500 mb-6">This agent hasn't received any reviews yet.</p>
                        {user && user.id !== agent.id && (
                          <button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
                          >
                            <Star className="w-4 h-4" />
                            <span>Be the First to Review</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        {user && user.id !== agent.id && (
                          <div className="mb-6 flex justify-end">
                            <button
                              onClick={() => setShowReviewForm(true)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                              <Star className="w-4 h-4" />
                              <span>Write Review</span>
                            </button>
                          </div>
                        )}
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <motion.div
                              key={review.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border border-gray-200 rounded-lg p-6"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium">
                                      {getInitials(review.reviewer.full_name)}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{review.reviewer.full_name}</h4>
                                    <div className="flex items-center space-x-1">
                                      {renderStars(review.rating)}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatDate(review.created_at)}
                                </span>
                              </div>
                              {review.comment && (
                                <p className="text-gray-700 mb-3">{review.comment}</p>
                              )}
                              {review.property && (
                                <p className="text-sm text-gray-500">
                                  Property: {review.property.title}
                                </p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    {agent.bio ? (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                        <p className="text-gray-700 leading-relaxed">{agent.bio}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No bio available</p>
                      </div>
                    )}

                    {agent.license_number && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">License Information</h3>
                        <p className="text-gray-700">License Number: {agent.license_number}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-600">Rating</span>
                  </div>
                  <span className="font-semibold">{agent.rating || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-600">Total Sales</span>
                  </div>
                  <span className="font-semibold">{agent.total_sales || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-gray-600">Experience</span>
                  </div>
                  <span className="font-semibold">{agent.experience_years || 0} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-600">Commission</span>
                  </div>
                  <span className="font-semibold">{agent.commission_rate || 2.5}%</span>
                </div>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{agent.email}</span>
                </div>
                {agent.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{agent.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">Joined {formatDate(agent.created_at)}</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {properties.length} active listings
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {reviews.length} reviews received
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          agentId={agent.id}
          onClose={() => setShowReviewForm(false)}
          onReviewSubmitted={() => {
            fetchAgentDetails();
            setShowReviewForm(false);
          }}
        />
      )}
    </div>
  );
};

export default AgentDetailsPage;