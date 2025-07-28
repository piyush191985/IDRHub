import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Activity, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Database,
  Settings,
  X,
  XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useCustomRoles } from '../hooks/useCustomRoles';
import { useAdmin } from '../hooks/useAdmin';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
    role: string;
  };
}

interface UserActivity {
  id: string;
  user_id: string;
  last_seen: string;
  is_online: boolean;
  current_page: string;
  session_duration: number;
  user?: {
    full_name: string;
    email: string;
    role: string;
  };
}

interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

const AdminAdvancedControls: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'audit' | 'roles' | 'activity'>('audit');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterTable, setFilterTable] = useState('all');

  // Memoize filters to prevent infinite fetch loop
  const filters = useMemo(() => ({
    action: filterAction,
    table_name: filterTable,
    search: searchTerm
  }), [filterAction, filterTable, searchTerm]);

  // Use memoized filters
  const { auditLogs, loading: auditLoading, error: auditError, hasMore, loadMore } = useAuditLogs(filters);

  const { roles: customRoles, loading: rolesLoading, error: rolesError, createRole } = useCustomRoles();
  const { allAgents, pendingAgents, pendingProperties, verifiedProperties, loading: usersLoading, error: usersError } = useAdmin();

  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Remove newRoleName, newRoleDescription, newRolePermissions state
  // Add selectedRoleId state
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [assigningRole, setAssigningRole] = useState(false);

  // Helper function to get relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  useEffect(() => {
    if (user && user.role === 'admin' && activeTab === 'activity') {
      fetchUserActivity();
    }
  }, [user, activeTab]);

  const fetchUserActivity = async () => {
    setActivityLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select(`
          *,
          user:users!user_activity_user_id_fkey(
            full_name,
            email,
            role
          )
        `)
        .order('last_seen', { ascending: false });

      if (error) throw error;
      setUserActivities(data || []);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      toast.error('Failed to load user activity');
    } finally {
      setActivityLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.table_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action.toLowerCase() === filterAction.toLowerCase();
    const matchesTable = filterTable === 'all' || log.table_name.toLowerCase() === filterTable.toLowerCase();
    
    return matchesSearch && matchesAction && matchesTable;
  });

  // Add this function to handle role creation and user assignment
  // Function to assign an existing role to users
  const handleAssignRole = async () => {
    if (!selectedRoleId || selectedUserIds.length === 0) return;
    setAssigningRole(true);
    try {
      const role = customRoles.find(r => r.id === selectedRoleId);
      if (!role) throw new Error('Role not found');
      const { error } = await supabase
        .from('users')
        .update({ role: role.name })
        .in('id', selectedUserIds);
      if (error) throw error;
      setSelectedRoleId('');
      setSelectedUserIds([]);
      setIsAssignRoleModalOpen(false);
    } catch (err) {
      alert('Error assigning role: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setAssigningRole(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Admin Controls</h1>
              <p className="text-gray-600">Audit logs, role management, and user activity monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex space-x-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Audit Logs</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('roles')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'roles'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Role Editor</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('activity')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'activity'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>User Activity</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(auditLoading || rolesLoading || activityLoading) ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Audit Logs Tab */}
            {activeTab === 'audit' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search audit logs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Actions</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                      </select>
                      <select
                        value={filterTable}
                        onChange={(e) => setFilterTable(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Tables</option>
                        <option value="users">Users</option>
                        <option value="properties">Properties</option>
                        <option value="agents">Agents</option>
                        <option value="favorites">Favorites</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Audit Logs List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
                    <p className="text-sm text-gray-600">Track all system changes and user actions</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAuditLogs.map((log) => (
                          <motion.tr
                            key={log.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {getActionIcon(log.action)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                  {log.action}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {log.user?.full_name || 'Unknown User'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {log.user?.email || 'No email'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{log.table_name}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div className="font-medium">Record ID: {log.record_id}</div>
                                {log.old_values && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Old: {JSON.stringify(log.old_values).substring(0, 50)}...
                                  </div>
                                )}
                                {log.new_values && (
                                  <div className="text-xs text-gray-500">
                                    New: {JSON.stringify(log.new_values).substring(0, 50)}...
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.ip_address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Role Editor Tab */}
            {activeTab === 'roles' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Custom Roles</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      onClick={() => setIsAssignRoleModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Assign Role to Users
                    </motion.button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customRoles.map((role) => (
                      <motion.div
                        key={role.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">{role.name}</h4>
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                        <div className="space-y-1">
                          {role.permissions.map((permission, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-gray-600">{permission}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* User Activity Tab */}
            {activeTab === 'activity' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Activity Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">User Activity Controls</h3>
                      <p className="text-sm text-gray-600">Monitor and manage user sessions</p>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchUserActivity}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                      >
                        <Activity className="w-4 h-4" />
                        <span>Refresh</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          try {
                            await supabase.rpc('mark_users_offline');
                            toast.success('Marked inactive users as offline');
                            fetchUserActivity();
                          } catch (error) {
                            toast.error('Failed to mark users offline');
                          }
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 flex items-center space-x-2"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Mark Inactive Offline</span>
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Activity Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Online Users</p>
                          <p className="text-2xl font-bold text-green-900">
                            {userActivities.filter(a => a.is_online).length}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Offline Users</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {userActivities.filter(a => !a.is_online).length}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Users</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {userActivities.length}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Active Sessions</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {userActivities.filter(a => a.is_online && a.session_duration > 0).length}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onChange={(e) => {
                            const searchTerm = e.target.value.toLowerCase();
                            // Filter userActivities based on search
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="all">All Status</option>
                        <option value="online">Online Only</option>
                        <option value="offline">Offline Only</option>
                      </select>
                      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="agent">Agent</option>
                        <option value="buyer">Buyer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Enhanced Activity Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Real-time User Activity</h3>
                    <p className="text-sm text-gray-600">Monitor user sessions and activity with live updates</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Page</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userActivities.map((activity) => (
                          <motion.tr
                            key={activity.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`hover:bg-gray-50 transition-colors ${
                              activity.is_online ? 'bg-green-50/30' : ''
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {activity.user?.full_name?.charAt(0) || 'U'}
                                  </div>
                                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                    activity.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                  }`}></div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {activity.user?.full_name || 'Unknown User'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {activity.user?.email || 'No email'}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {activity.user?.role || 'Unknown Role'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  activity.is_online 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {activity.is_online ? (
                                    <>
                                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                      Online
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                                      Offline
                                    </>
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div className="flex items-center space-x-2">
                                  <Globe className="w-4 h-4 text-gray-400" />
                                  <span className="truncate max-w-32">
                                    {activity.current_page || 'Unknown'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {activity.session_duration > 0 ? (
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>
                                      {Math.floor(activity.session_duration / 60)}m {activity.session_duration % 60}s
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>
                                    {new Date(activity.last_seen).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {getRelativeTime(activity.last_seen)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center space-x-2">
                                {activity.is_online && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={async () => {
                                      try {
                                        await supabase
                                          .from('user_activity')
                                          .update({ is_online: false })
                                          .eq('user_id', activity.user_id);
                                        toast.success(`Marked ${activity.user?.full_name} as offline`);
                                        fetchUserActivity();
                                      } catch (error) {
                                        toast.error('Failed to mark user offline');
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                    title="Mark as offline"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </motion.button>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    // View user details or send message
                                    toast.success(`Viewing details for ${activity.user?.full_name}`);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Empty State */}
                  {userActivities.length === 0 && (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No User Activity</h3>
                      <p className="text-gray-500">No users have been tracked yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
      {/* Assign Role Modal */}
      {isAssignRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setIsAssignRoleModalOpen(false)}
              disabled={assigningRole}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4">Assign Existing Role</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={selectedRoleId}
                onChange={e => setSelectedRoleId(e.target.value)}
                disabled={assigningRole}
              >
                <option value="">-- Select a Role --</option>
                {customRoles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Users</label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {usersLoading ? (
                  <div>Loading users...</div>
                ) : usersError ? (
                  <div className="text-red-500">Error loading users</div>
                ) : allAgents.length === 0 ? (
                  <div>No users found</div>
                ) : (
                  allAgents.map((agent: any) => (
                    <label key={agent.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(agent.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedUserIds(prev => [...prev, agent.id]);
                          } else {
                            setSelectedUserIds(prev => prev.filter(id => id !== agent.id));
                          }
                        }}
                        disabled={assigningRole}
                      />
                      <span>{agent.full_name} ({agent.email})</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={handleAssignRole}
              disabled={assigningRole || !selectedRoleId || selectedUserIds.length === 0}
            >
              {assigningRole ? 'Assigning...' : 'Assign Role'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdvancedControls; 