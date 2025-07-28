import React from 'react';
import { useAgentDashboard } from '../hooks/useAgentDashboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const AgentDashboardHome: React.FC = () => {
  const { stats, reviews, loading, error } = useAgentDashboard();

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
        <p>Error loading dashboard: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome, Agent!</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalProperties}</div>
          <div className="text-gray-600 mt-2">Total Properties</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-pink-600">{stats.totalLikes}</div>
          <div className="text-gray-600 mt-2">Total Likes</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.totalInquiries}</div>
          <div className="text-gray-600 mt-2">Total Inquiries</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-yellow-500">{stats.avgRating}</div>
          <div className="text-gray-600 mt-2">Avg. Rating</div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Reviews</h2>
        <ul className="divide-y divide-gray-200">
          {reviews.map((review) => (
            <li key={review.id} className="py-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{review.reviewer_name}</span>
                <span className="text-yellow-500 font-bold">{'★'.repeat(review.rating)}</span>
              </div>
              <div className="text-gray-600 mt-1">{review.comment}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AgentDashboardHome; 