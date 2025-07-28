import React from 'react';
import { useAgentDashboard } from '../hooks/useAgentDashboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const AgentStatsPage: React.FC = () => {
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
        <p>Error loading stats: {error}</p>
      </div>
    );
  }

  // Calculate review breakdown from reviews
  const reviewBreakdown = [
    { stars: 5, count: reviews.filter(r => r.rating === 5).length },
    { stars: 4, count: reviews.filter(r => r.rating === 4).length },
    { stars: 3, count: reviews.filter(r => r.rating === 3).length },
    { stars: 2, count: reviews.filter(r => r.rating === 2).length },
    { stars: 1, count: reviews.filter(r => r.rating === 1).length },
  ];

  // Calculate total reviews for percentage calculation
  const totalReviews = reviews.length;
  const maxCount = Math.max(...reviewBreakdown.map(item => item.count));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Performance & Stats</h1>
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
        <h2 className="text-lg font-semibold mb-4">Review Breakdown</h2>
        <ul className="divide-y divide-gray-200">
          {reviewBreakdown.map((item) => {
            // Calculate percentage based on the maximum count to ensure proper scaling
            const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            
            return (
              <li key={item.stars} className="py-2 flex items-center">
                <span className="w-16 font-medium text-gray-800">{item.stars}★</span>
                <div className="flex-1 h-3 bg-gray-100 rounded mx-2">
                  <div 
                    className="h-3 bg-yellow-400 rounded" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-right text-gray-700">{item.count}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AgentStatsPage; 