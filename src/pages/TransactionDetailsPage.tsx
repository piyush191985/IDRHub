import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Building, 
  User, 
  DollarSign, 
  Calendar, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Users,
  Home,
  File,
  Plus
} from 'lucide-react';

const TransactionDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [paperwork, setPaperwork] = useState<any[]>([]);
  const [paperworkLoading, setPaperworkLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true);
      try {
      const { data, error } = await supabase
        .from('transactions')
          .select(`
            *,
            property:property_id(title, address, city, state, zip_code, price, bedrooms, bathrooms, square_feet),
            agent:agent_id(full_name, email, phone),
            buyer:buyer_id(full_name, email, phone),
            seller:seller_id(full_name, email, phone),
            buyer_details:buyer_details_id(full_name, email, phone, address, city, state, zip_code, is_external)
          `)
        .eq('id', id)
        .single();
        
        if (error) throw error;
        
        // Check if user has access to this transaction
        if (user?.role === 'agent' && data.agent_id !== user.id) {
          throw new Error('Access denied. You can only view your own transactions.');
        }
        
        setTransaction(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
      setLoading(false);
      }
    };
    fetchTransaction();
  }, [id, user]);

  useEffect(() => {
    if (activeTab === 'documents') {
      const fetchPaperwork = async () => {
        setPaperworkLoading(true);
        try {
          const { data } = await supabase
            .from('paperwork')
            .select('*, uploaded_by_user:uploaded_by(full_name)')
            .eq('transaction_id', id);
          setPaperwork(data || []);
        } catch (err) {
          console.error('Error fetching paperwork:', err);
        } finally {
          setPaperworkLoading(false);
        }
      };
      fetchPaperwork();
    }
  }, [activeTab, id]);

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
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'in_progress': return <AlertCircle className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
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

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Not Found</h2>
            <p className="text-gray-600 mb-4">The transaction you're looking for doesn't exist.</p>
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
                  <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
                  <p className="text-gray-600">ID: {transaction.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                  {getStatusIcon(transaction.status)}
                  <span className="ml-2">{transaction.status.replace('_', ' ').toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Details</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'documents'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <File className="w-4 h-4" />
                  <span>Documents</span>
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Property Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Property Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Title</span>
                      <p className="text-gray-900">{transaction.property?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Address</span>
                      <p className="text-gray-900">{transaction.property?.address || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Location</span>
                      <p className="text-gray-900">
                        {transaction.property?.city}, {transaction.property?.state} {transaction.property?.zip_code}
                      </p>
                    </div>
                    {transaction.property?.price && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Property Price</span>
                        <p className="text-gray-900 font-semibold">{formatPrice(transaction.property.price)}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-500">Bedrooms</span>
                      <p className="text-gray-900">{transaction.property?.bedrooms || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Bathrooms</span>
                      <p className="text-gray-900">{transaction.property?.bathrooms || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Transaction Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Transaction Price</span>
                      <p className="text-gray-900 font-semibold text-lg">{formatPrice(transaction.price || 0)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <p className="text-gray-900">{transaction.status.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Offer Date</span>
                      <p className="text-gray-900">{formatDate(transaction.offer_date)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Contract Date</span>
                      <p className="text-gray-900">{formatDate(transaction.contract_date)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Closing Date</span>
                      <p className="text-gray-900">{formatDate(transaction.closing_date)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Created</span>
                      <p className="text-gray-900">{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* People Involved */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    People Involved
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Agent</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-900">{transaction.agent?.full_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-900">{transaction.agent?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-900">{transaction.agent?.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
        <div>
                       <h4 className="font-medium text-gray-900 mb-3">
                         Buyer
                         {transaction.buyer_details?.is_external && (
                           <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                             External
                           </span>
                         )}
                       </h4>
                       <div className="space-y-2">
                         <div className="flex items-center">
                           <User className="w-4 h-4 mr-2 text-gray-500" />
                           <span className="text-gray-900">
                             {transaction.buyer_details?.full_name || transaction.buyer?.full_name || 'N/A'}
                           </span>
                         </div>
                         <div className="flex items-center">
                           <Mail className="w-4 h-4 mr-2 text-gray-500" />
                           <span className="text-gray-900">
                             {transaction.buyer_details?.email || transaction.buyer?.email || 'N/A'}
                           </span>
                         </div>
                         <div className="flex items-center">
                           <Phone className="w-4 h-4 mr-2 text-gray-500" />
                           <span className="text-gray-900">
                             {transaction.buyer_details?.phone || transaction.buyer?.phone || 'N/A'}
                           </span>
                         </div>
                         {transaction.buyer_details?.address && (
                           <div className="flex items-center">
                             <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                             <span className="text-gray-900">
                               {transaction.buyer_details.address}
                               {transaction.buyer_details.city && `, ${transaction.buyer_details.city}`}
                               {transaction.buyer_details.state && `, ${transaction.buyer_details.state}`}
                               {transaction.buyer_details.zip_code && ` ${transaction.buyer_details.zip_code}`}
                             </span>
        </div>
      )}
                       </div>
                     </div>

                    {transaction.seller && transaction.seller.id !== transaction.agent?.id && (
        <div>
                        <h4 className="font-medium text-gray-900 mb-3">Seller</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-gray-900">{transaction.seller?.full_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-gray-900">{transaction.seller?.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-gray-900">{transaction.seller?.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Document
                  </button>
                </div>

                {paperworkLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : paperwork.length === 0 ? (
                  <div className="text-center py-8">
                    <File className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No documents uploaded</h3>
                    <p className="mt-2 text-gray-500">Upload documents related to this transaction.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded At</th>
                </tr>
              </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                {paperwork.map(doc => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.document_type}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <a 
                                  href={doc.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {doc.uploaded_by_user?.full_name || 'Unknown'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                  {doc.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(doc.uploaded_at)}
                              </td>
                  </tr>
                ))}
              </tbody>
            </table>
                    </div>
                  </div>
                )}
              </div>
          )}
          </div>
        </div>
      </div>

      {showUpload && (
        <UploadPaperworkModal 
          transactionId={id!} 
          onClose={() => setShowUpload(false)} 
        />
      )}
    </div>
  );
};

// Upload Modal Component
const UploadPaperworkModal: React.FC<{ transactionId: string; onClose: () => void }> = ({ transactionId, onClose }) => {
  const [documentType, setDocumentType] = useState('contract');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('pending');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const documentTypes = ['contract', 'disclosure', 'id', 'offer', 'other'];
  const statusOptions = ['pending', 'signed', 'reviewed', 'completed'];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      // Upload file to Supabase Storage
      const filePath = `paperwork/${transactionId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('paperwork').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { publicUrl } = supabase.storage.from('paperwork').getPublicUrl(filePath).data;
      
      // Insert into paperwork table
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || 'unknown';
      const { error: insertError } = await supabase.from('paperwork').insert([
        {
          transaction_id: transactionId,
          document_type: documentType,
          file_url: publicUrl,
          uploaded_by: userId,
          status,
          uploaded_at: new Date().toISOString(),
        },
      ]);
      if (insertError) throw insertError;
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
        </div>
        
        <form onSubmit={handleUpload} className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <select 
                value={documentType} 
                onChange={e => setDocumentType(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
            </select>
          </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                ))}
            </select>
          </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
              <input 
                type="file" 
                onChange={e => setFile(e.target.files?.[0] || null)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors" 
              onClick={onClose} 
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" 
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionDetailsPage; 