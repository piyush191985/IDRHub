import React, { useState } from 'react';
import { useAgentDashboard } from '../hooks/useAgentDashboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EditPropertyModal } from '../components/properties/EditPropertyModal';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, DollarSign } from 'lucide-react';
import { Property } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const AgentMyPropertiesPage: React.FC = () => {
  const { properties, loading, error, deleteProperty, refreshData } = useAgentDashboard();
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [soldModal, setSoldModal] = useState<{ open: boolean; property: Property | null }>({ open: false, property: null });
  const [salePrice, setSalePrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();

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
        <p>Error loading properties: {error}</p>
      </div>
    );
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(propertyId);
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProperty(null);
  };

  const handlePropertyUpdated = () => {
    // Refresh the properties data
    refreshData();
  };

  const handleMarkAsSold = (property: Property) => {
    setSoldModal({ open: true, property });
  };

  const handleCloseSoldModal = () => {
    setSoldModal({ open: false, property: null });
    setSalePrice('');
    setBuyerName('');
    setBuyerEmail('');
    setBuyerPhone('');
  };

  const handleConfirmSale = async () => {
    if (!soldModal.property || !user) return;

    if (!salePrice || !buyerName || !buyerEmail || !buyerPhone) {
      alert('Please fill in all required fields.');
      return;
    }

    setProcessing(true);
    try {
      // First, create a buyer record
      const { data: buyerData, error: buyerError } = await supabase
        .from('buyers')
        .insert([
          {
            full_name: buyerName,
            email: buyerEmail,
            phone: buyerPhone,
            is_external: true, // This is an external buyer
            user_id: null // No linked user since this is external
          }
        ])
        .select()
        .single();

      if (buyerError) throw buyerError;

      // Then, create a transaction record with the buyer details
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            property_id: soldModal.property.id,
            agent_id: user.id,
            buyer_id: null, // Keep the old buyer_id field for backward compatibility
            seller_id: user.id, // Agent is the seller
            buyer_details_id: buyerData.id, // Link to the new buyer record
            price: Number(salePrice),
            status: 'completed', // Use 'completed' instead of 'sold'
            offer_date: new Date().toISOString(),
            contract_date: new Date().toISOString(),
            closing_date: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update the property status to sold
      const { error: propertyError } = await supabase
        .from('properties')
        .update({ status: 'sold' })
        .eq('id', soldModal.property.id);

      if (propertyError) throw propertyError;

      alert('Property marked as sold successfully! Transaction has been recorded.');
      handleCloseSoldModal();
      refreshData();
    } catch (error: any) {
      console.error('Error marking property as sold:', error);
      alert(`Failed to mark property as sold: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Properties</h1>
      {properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No properties found. Add your first property!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Likes</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Inquiries</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Views</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.map((property) => (
                <tr key={property.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">{property.title}</td>
                  <td className="px-4 py-2 text-gray-700 capitalize">
                    {property.status === 'sold' ? (
                      <span className="inline-block px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">Sold</span>
                    ) : (
                      property.status
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">{property.likes_count}</td>
                  <td className="px-4 py-2 text-center">{property.inquiries_count}</td>
                  <td className="px-4 py-2 text-center">{property.views_count}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Link
                        to={`/properties/${property.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleEditProperty(property)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {property.status !== 'sold' && (
                        <button 
                          onClick={() => handleMarkAsSold(property)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Mark as Sold"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteProperty(property.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Property Modal */}
      <EditPropertyModal
        property={editingProperty}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onPropertyUpdated={handlePropertyUpdated}
      />

      {/* Mark as Sold Modal */}
      {soldModal.open && soldModal.property && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Mark Property as Sold</h2>
              <p className="text-sm text-gray-600 mt-1">{soldModal.property.title}</p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (₹)</label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Enter sale price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Enter buyer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Email</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="Enter buyer email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Phone</label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="Enter buyer phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseSoldModal}
                disabled={processing}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSale}
                disabled={processing || !salePrice || !buyerName || !buyerEmail || !buyerPhone}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Mark as Sold'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentMyPropertiesPage; 