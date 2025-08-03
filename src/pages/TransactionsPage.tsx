import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, Eye, Calendar, DollarSign, User, Building, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'booking', label: 'Bookings' },
  { value: 'sale', label: 'Sales' }
];

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch sales transactions
        let transactionQuery = supabase
          .from('transactions')
          .select(`
            *,
            property:property_id(title, address),
            agent:agent_id(full_name, email),
            buyer:buyer_id(full_name, email),
            seller:seller_id(full_name, email),
            buyer_details:buyer_details_id(full_name, email, phone, is_external)
          `);
        
        // Apply role-based filtering
        if (user?.role === 'agent') {
          transactionQuery = transactionQuery.eq('agent_id', user.id);
        }
        
        if (status !== 'all') {
          transactionQuery = transactionQuery.eq('status', status);
        }

        const { data: transactionData, error: transactionError } = await transactionQuery.order('created_at', { ascending: false });
        if (transactionError) throw transactionError;

        // Fetch bookings
        let bookingQuery = supabase
          .from('bookings')
          .select('*, property:property_id(title, address), agent:agent_id(full_name, email)');
        
        // Apply role-based filtering for bookings
        if (user?.role === 'agent') {
          bookingQuery = bookingQuery.eq('agent_id', user.id);
        }
        
      if (status !== 'all') {
          bookingQuery = bookingQuery.eq('status', status);
        }

        const { data: bookingData, error: bookingError } = await bookingQuery.order('created_at', { ascending: false });
        if (bookingError) throw bookingError;

        setTransactions(transactionData || []);
        setBookings(bookingData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, user]);

  // Filter data based on search term and type
  const filteredData = React.useMemo(() => {
    let data = [];
    
    if (type === 'all' || type === 'sale') {
      data.push(...transactions.map(tx => ({ ...tx, type: 'sale' })));
    }
    
    if (type === 'all' || type === 'booking') {
      data.push(...bookings.map(booking => ({ ...booking, type: 'booking' })));
    }

    if (searchTerm) {
      data = data.filter(item => 
        item.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.buyer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.agent?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  }, [transactions, bookings, type, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                <p className="text-gray-600 mt-2">
                  {user?.role === 'admin' ? 'All transactions across the platform' : 'Your transaction history'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
                  <div className="text-sm text-gray-500">Total {type === 'all' ? 'Items' : type === 'sale' ? 'Sales' : 'Bookings'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
        </select>
      </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setStatus('all');
                  setType('all');
                  setSearchTerm('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {error ? (
              <div className="text-center py-8">
                <div className="text-red-600 text-lg font-medium">{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions found</h3>
                <p className="mt-2 text-gray-500">
                  {searchTerm || status !== 'all' || type !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'No transactions have been created yet.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status.replace('_', ' ').toUpperCase()}</span>
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {item.type.toUpperCase()}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.property?.title || 'Property'}
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            <span>
                              {item.type === 'booking' 
                                ? `Customer: ${item.customer_name}`
                                : `Buyer: ${item.buyer_details?.full_name || item.buyer?.full_name || 'N/A'}${item.buyer_details?.is_external ? ' (External)' : ''}`
                              }
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-2" />
                            <span>Agent: {item.agent?.full_name || 'N/A'}</span>
                          </div>
                          
                          {item.type === 'sale' && item.price && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>{formatPrice(item.price)}</span>
                            </div>
                          )}
                          {item.type === 'booking' && item.token_amount && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>Token: {formatPrice(item.token_amount)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center mt-3 text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Created: {formatDate(item.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          to={item.type === 'booking' ? `/bookings/${item.id}` : `/transactions/${item.id}`}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage; 