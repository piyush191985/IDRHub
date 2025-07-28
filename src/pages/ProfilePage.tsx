import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Camera, 
  Edit, 
  Save, 
  X,
  Mail,
  Phone,
  MapPin,
  Award,
  Star,
  Building,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { uploadFileLocally, getFileUrl } from '../utils/fileUpload';
import { supabase } from '../lib/supabase';
import { useAgentProfile } from '../hooks/useAgentProfile';

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
  bio?: string;
  avatar_url?: string;
  // Agent-specific fields
  license_number?: string;
  experience_years?: number;
  specializations?: string[];
  rating?: number;
  total_sales?: number;
  commission_rate?: number;
  verified?: boolean;
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { agentData, updateAgentProfile } = useAgentProfile();
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    avatar_url: '',
    license_number: '',
    experience_years: 0,
    specializations: [],
    rating: 0,
    total_sales: 0,
    commission_rate: 2.5,
    verified: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: agentData?.bio || '',
        avatar_url: user.avatar_url || '',
        license_number: agentData?.license_number || '',
        experience_years: agentData?.experience_years || 0,
        specializations: agentData?.specializations || [],
        rating: agentData?.rating || 0,
        total_sales: agentData?.total_sales || 0,
        commission_rate: agentData?.commission_rate || 2.5,
        verified: agentData?.verified || false,
      });
    }
  }, [user, agentData]);

  const handleInputChange = (field: keyof ProfileFormData, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Update user profile
      await updateProfile(formData);
      
      // If user is an agent, also update agents table
      if (user.role === 'agent') {
        const result = await updateAgentProfile({
          license_number: formData.license_number,
          bio: formData.bio,
          experience_years: formData.experience_years,
          specializations: formData.specializations,
          rating: formData.rating,
          total_sales: formData.total_sales,
          commission_rate: formData.commission_rate,
          verified: formData.verified,
        });

        if (!result.success) {
          toast.error('Failed to update agent profile');
          return;
        }
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Upload to local storage
      const uploadedPath = await uploadFileLocally(file, 'avatars');

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: uploadedPath });
      setFormData(prev => ({ ...prev, avatar_url: uploadedPath }));
      
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Manage your account information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Profile Picture Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {formData.avatar_url ? (
                  <img
                    src={getFileUrl(formData.avatar_url)}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {getInitials(formData.full_name)}
                    </span>
                  </div>
                )}
                
                <button
                  onClick={triggerFileInput}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {isEditing ? 'Edit Profile' : 'Profile Information'}
                </h2>
                <p className="text-gray-600">
                  {isEditing 
                    ? 'Update your profile information below'
                    : 'Your account details and preferences'
                  }
                </p>
              </div>
              
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-900">
                    <User className="w-4 h-4" />
                    <span>{formData.full_name || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <Mail className="w-4 h-4" />
                  <span>{formData.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-900">
                    <Phone className="w-4 h-4" />
                    <span>{formData.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Role
                </label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <Award className="w-4 h-4" />
                  <span className="capitalize">{user.role}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-900">
                  {formData.bio || 'No bio provided'}
                </p>
              )}
            </div>
          </div>

          {/* Agent-specific fields */}
          {user.role === 'agent' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Agent Information</span>
                {formData.verified && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Verified
                  </span>
                )}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={formData.license_number || ''}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={formData.experience_years || 0}
                    onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.commission_rate || 2.5}
                    onChange={(e) => handleInputChange('commission_rate', parseFloat(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Sales
                  </label>
                  <input
                    type="number"
                    value={formData.total_sales || 0}
                    onChange={(e) => handleInputChange('total_sales', parseInt(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations (comma-separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(formData.specializations) ? formData.specializations.join(', ') : ''}
                  onChange={(e) => handleInputChange('specializations', e.target.value.split(',').map(s => s.trim()))}
                  disabled={!isEditing}
                  placeholder="Residential, Commercial, Luxury"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 resize-none"
                  placeholder="Tell us about your experience and expertise..."
                />
              </div>
            </div>
          )}

          {/* Agent Stats (if agent) */}
          {user.role === 'agent' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Agent Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {(user as any).rating || 0}
                    </span>
                  </div>
                  <p className="text-gray-600">Rating</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Building className="w-5 h-5 text-blue-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {(user as any).total_sales || 0}
                    </span>
                  </div>
                  <p className="text-gray-600">Total Sales</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {(user as any).experience_years || 0}
                    </span>
                  </div>
                  <p className="text-gray-600">Years Experience</p>
                </div>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Member Since</p>
                  <p className="text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">Account Status</p>
                  <p className="text-sm text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage; 