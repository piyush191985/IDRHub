import React from 'react';
import { useBookings } from '../hooks/useBookings';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const AdminBookingsPage: React.FC = () => {
  const { bookings, loading, error } = useBookings();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">All Property Bookings</h1>
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="text-gray-500">No bookings found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow border">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Property</th>
                <th className="px-4 py-2 text-left">Agent</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Token Amount</th>
                <th className="px-4 py-2 text-left">Booked At</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="font-semibold">{booking.property?.title}</div>
                    <div className="text-xs text-gray-500">{booking.property?.address}</div>
                  </td>
                  <td className="px-4 py-2">{booking.property?.agent?.full_name}</td>
                  <td className="px-4 py-2">{booking.customer_name}</td>
                  <td className="px-4 py-2">
                    <div>{booking.customer_email}</div>
                    <div>{booking.customer_phone}</div>
                  </td>
                  <td className="px-4 py-2 capitalize">{booking.status}</td>
                  <td className="px-4 py-2">{booking.token_amount ? `₹${booking.token_amount}` : '-'}</td>
                  <td className="px-4 py-2">{format(new Date(booking.created_at), 'PPpp')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage; 