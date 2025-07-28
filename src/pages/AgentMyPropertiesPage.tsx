import React, { useState } from 'react';
import { useAgentDashboard } from '../hooks/useAgentDashboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EditPropertyModal } from '../components/properties/EditPropertyModal';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Property } from '../types';

const AgentMyPropertiesPage: React.FC = () => {
  const { properties, loading, error, deleteProperty, refreshData } = useAgentDashboard();
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    </div>
  );
};

export default AgentMyPropertiesPage; 