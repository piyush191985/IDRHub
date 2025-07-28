import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  TrendingUp,
  Search,
  Filter,
  Grid,
  List,
  Users
} from 'lucide-react';
import { useAgents } from '../hooks/useAgents';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Agent } from '../types';
import { UserAvatar } from '../components/common/UserAvatar';

export const AgentsPage: React.FC = () => {
  const { agents, loading, error } = useAgents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');



  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || 
                                 agent.specializations?.includes(selectedSpecialization);
    return matchesSearch && matchesSpecialization;
  });

  const allSpecializations = Array.from(
    new Set(agents.flatMap(agent => agent.specializations || []))
  );

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Agents</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Find Your Perfect Agent
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with verified real estate professionals who will help you 
              find your dream home or sell your property with confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agents by name or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                {allSpecializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredAgents.length} Agents Found
          </h2>
        </div>

        {/* Agents Grid/List */}
        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
            }
          >
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={`${viewMode === 'list' ? 'flex-shrink-0' : ''}`}>
                  <div className={`${viewMode === 'list' ? 'w-32 h-32' : 'w-full h-48'} ${agent.avatar_url ? 'bg-white' : 'bg-gradient-to-br from-blue-500 to-purple-600'} flex items-center justify-center`}>
                    <UserAvatar user={agent} size={agent.avatar_url ? "4xl" : "xl"} className={agent.avatar_url ? "bg-white" : "bg-white text-blue-600"} />
                  </div>
                </div>

                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {agent.full_name}
                      </h3>
                      {agent.verified && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Award className="w-4 h-4" />
                          <span className="text-sm font-medium">Verified Agent</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">
                            {agent.rating ? agent.rating.toFixed(1) : 'N/A'}
                          </span>
                          {agent.rating && (
                            <Star
                              className={`w-4 h-4 ml-1 ${
                                agent.rating >= 1 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {agent.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {agent.bio}
                    </p>
                  )}

                  {agent.specializations && agent.specializations.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {agent.specializations.slice(0, 3).map(spec => (
                          <span
                            key={spec}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                        {agent.specializations.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{agent.specializations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{agent.experience_years || 0} years exp.</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4" />
                      <span>{agent.total_sales || 0} sales</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/agents/${agent.id}`}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                    >
                      View Profile
                    </Link>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      <Mail className="w-4 h-4" />
                    </button>
                    {agent.phone && (
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Phone className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};