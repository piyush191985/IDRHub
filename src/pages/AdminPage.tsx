import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2,
  Settings,
  BarChart3,
  Activity,
  Database,
  Home,
  Clock,
  Star
} from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import toast from 'react-hot-toast';

const AdminPage: React.FC = () => {
  const { 
    allAgents, 
    pendingAgents, 
    pendingProperties,
    verifiedProperties,
    loading, 
    error, 
    verifyAgent, 
    unverifyAgent,
    deleteAgent,
    approveProperty,
    rejectProperty
  } = useAdmin();
  const [activeTab, setActiveTab] = useState<'agents' | 'pending' | 'properties' | 'pending-properties'>('agents');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>Error loading admin data: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage users, agents, properties, and platform settings</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link
                to="/admin/advanced"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Database className="w-4 h-4" />
                <span>Advanced Controls</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{allAgents.length}</p>
                <p className="text-gray-600">Total Agents</p>
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
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingAgents.length}</p>
                <p className="text-gray-600">Pending Agents</p>
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
              <Home className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{verifiedProperties.length}</p>
                <p className="text-gray-600">Approved Properties</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingProperties.length}</p>
                <p className="text-gray-600">Pending Properties</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('agents')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'agents'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Agents ({allAgents.length})</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('pending')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Pending Agents ({pendingAgents.length})</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('properties')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'properties'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>All Properties ({verifiedProperties.length})</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('pending-properties')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'pending-properties'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Pending Properties ({pendingProperties.length})</span>
            </motion.button>
            <button
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-gray-100 text-gray-700 hover:bg-blue-50"
              onClick={() => window.location.href = '/admin/bookings'}
            >
              Bookings
            </button>
          </div>
        </div>

        {/* Content Tables */}
        {activeTab === 'agents' || activeTab === 'pending' ? (
          /* Agents Table */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {activeTab === 'agents' ? 'All Agents' : 'Pending Approval'}
              </h3>
              <p className="text-sm text-gray-600">
                {activeTab === 'agents' 
                  ? 'Manage all registered agents on the platform'
                  : 'Review and approve agent applications'
                }
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(activeTab === 'agents' ? allAgents : pendingAgents).map((agent) => (
                    <motion.tr
                      key={agent.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {agent.full_name?.charAt(0) || 'A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {agent.full_name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {agent.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.email || 'No email'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          agent.verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {agent.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(agent.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            to={`/agents/${agent.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          {!agent.verified ? (
                            <button
                              onClick={() => verifyAgent(agent.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Verify Agent"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => unverifyAgent(agent.id)}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Unverify Agent"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this agent?')) {
                                deleteAgent(agent.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Agent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Properties Table */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {activeTab === 'properties' ? 'All Properties' : 'Pending Properties'}
              </h3>
              <p className="text-sm text-gray-600">
                {activeTab === 'properties' 
                  ? 'Manage all approved properties on the platform'
                  : 'Review and approve property listings'
                }
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(activeTab === 'properties' ? verifiedProperties : pendingProperties).map((property) => (
                    <motion.tr
                      key={property.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                              <Home className="w-6 h-6" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {property.title || 'Untitled Property'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.address || 'No address'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.agent?.full_name || 'Unknown Agent'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(property.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          property.is_approved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {property.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(property.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            to={`/properties/${property.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          {!property.is_approved && (
                            <button
                              onClick={() => {
                                approveProperty(property.id)
                                  .then(() => {
                                    toast.success('Property approved successfully!');
                                  })
                                  .catch(() => {
                                    toast.error('Failed to approve property.');
                                  });
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Approve Property"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this property?')) {
                                rejectProperty(property.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Property"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;