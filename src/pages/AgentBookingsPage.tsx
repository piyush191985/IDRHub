import React, { useState } from 'react';
import { useBookings } from '../hooks/useBookings';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { useMessages } from '../hooks/useMessages';
import Modal from '../components/common/Modal';
import { supabase } from '../lib/supabase';
import { createTransaction } from '../hooks/useTransactions';
import { Link } from 'react-router-dom';

const AgentBookingsPage: React.FC = () => {
  const { bookings, loading, error, fetchBookings } = useBookings();
  const { sendMessage } = useMessages();
  const [whatsappModal, setWhatsappModal] = useState<{ open: boolean; booking: any } | null>(null);
  const [statusModal, setStatusModal] = useState<{ open: boolean; booking: any } | null>(null);
  const [tokenAmount, setTokenAmount] = useState('');
  const [updating, setUpdating] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendWhatsApp = async (booking: any) => {
    setSending(true);
    try {
      const message = `Hi ${booking.customer_name},\n\nPlease contact me on WhatsApp at ${whatsappNumber} for token payment and further details.\n\n[Chat on WhatsApp](https://wa.me/${whatsappNumber.replace(/\D/g, '')})`;
      await sendMessage(booking.customer_id, message, undefined, booking.property_id);
      setWhatsappModal(null);
      setWhatsappNumber('');
      alert('WhatsApp details sent!');
    } catch (err) {
      alert('Failed to send WhatsApp details.');
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async (booking: any, newStatus: string) => {
    setUpdating(true);
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        throw new Error('No valid session found. Please sign in again.');
      }
      
      let updates: any = { status: newStatus };
      if (newStatus === 'booked') {
        updates.token_amount = Number(tokenAmount);
      }
      
      // Update booking in Supabase
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', booking.id)
        .select();
        
      if (bookingError) {
        console.error('❌ Booking update error:', bookingError);
        throw new Error(`Booking update failed: ${bookingError.message}`);
      }
      
      // If booking is now 'booked', update the property status as well
      if (newStatus === 'booked') {
        
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .update({ status: 'booked' })
          .eq('id', booking.property_id)
          .select();
          
        if (propertyError) {
          console.error('❌ Property update error:', propertyError);
          throw new Error(`Property update failed: ${propertyError.message}`);
        }
        
      }
      
      setStatusModal(null);
      setTokenAmount('');
      fetchBookings();
      alert('Booking status updated!');
    } catch (err) {
      console.error('❌ Status update failed:', err);
      alert(`Failed to update status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Property Bookings</h1>
      </div>
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
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Token Amount</th>
                <th className="px-4 py-2 text-left">Booked At</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="font-semibold">{booking.property?.title}</div>
                    <div className="text-xs text-gray-500">{booking.property?.address}</div>
                  </td>
                  <td className="px-4 py-2">{booking.customer_name}</td>
                  <td className="px-4 py-2">
                    <div>{booking.customer_email}</div>
                    <div>{booking.customer_phone}</div>
                  </td>
                  <td className="px-4 py-2 capitalize">{booking.status}</td>
                  <td className="px-4 py-2">{booking.token_amount ? `₹${booking.token_amount}` : '-'}</td>
                  <td className="px-4 py-2">{format(new Date(booking.created_at), 'PPpp')}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                      onClick={() => setWhatsappModal({ open: true, booking })}
                    >
                      Send WhatsApp Details
                    </button>
                    <button
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                      onClick={() => setStatusModal({ open: true, booking })}
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* WhatsApp Modal */}
      {whatsappModal?.open && (
        <Modal onClose={() => { setWhatsappModal(null); setWhatsappNumber(''); }}>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Send WhatsApp Details</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              placeholder="Enter your WhatsApp number"
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              autoFocus
            />
            <button
              className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors mb-2"
              onClick={() => handleSendWhatsApp(whatsappModal.booking)}
              disabled={sending || !whatsappNumber.trim()}
            >
              {sending ? 'Sending...' : 'Send Message' }
            </button>
            <button
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              onClick={() => { setWhatsappModal(null); setWhatsappNumber(''); }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Status Modal */}
      {statusModal?.open && (
        <Modal onClose={() => setStatusModal(null)}>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Update Booking Status</h2>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              defaultValue={statusModal.booking.status}
              onChange={e => {
                if (e.target.value === 'booked') {
                  setStatusModal({ ...statusModal, booking: { ...statusModal.booking, status: 'booked' } });
                } else {
                  handleStatusUpdate(statusModal.booking, e.target.value);
                }
              }}
            >
              <option value="pending">Pending</option>
              <option value="booked">Booked</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {statusModal.booking.status === 'booked' && (
              <>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
                  placeholder="Enter token amount (₹)"
                  value={tokenAmount}
                  onChange={e => setTokenAmount(e.target.value)}
                />
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors mb-2"
                  onClick={() => handleStatusUpdate(statusModal.booking, 'booked')}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </>
            )}
            <button
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              onClick={() => setStatusModal(null)}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AgentBookingsPage; 