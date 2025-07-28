import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { supabase } from '../../lib/supabase';

/**
 * BookingModal Props
 * @param open - Whether the modal is open
 * @param onClose - Function to close the modal
 * @param property - The property object (must have title, images)
 * @param user - The current user object (must have full_name, email, phone)
 * @param onSuccess - Callback when booking is successful
 * @param onError - Callback when booking fails
 */
interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  property: any;
  user: any;
  onSuccess?: () => void;
  onError?: () => void;
}

const fallbackImage = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800';

const BookingModal: React.FC<BookingModalProps> = ({ open, onClose, property, user, onSuccess, onError }) => {
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [permission, setPermission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  // Only close if click is outside modal box
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className="w-full max-w-2xl md:max-w-[70vw] h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header: Property image and name */}
        <div className="w-full flex flex-col items-center">
          <img
            src={property?.images?.[0] || fallbackImage}
            alt={property?.title}
            className="object-cover w-full h-40 sm:h-48 md:h-56 rounded-t-2xl"
          />
          <h2 className="text-xl sm:text-2xl font-bold text-center mt-4 mb-2 px-4 truncate" title={property?.title}>{property?.title}</h2>
        </div>
        {/* Body: Form */}
        <form
          className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6"
          onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              // Save booking to Supabase
              const { error } = await supabase.from('bookings').insert([
                {
                  property_id: property?.id,
                  agent_id: property?.agent_id,
                  customer_id: user?.id,
                  customer_name: name,
                  customer_email: email,
                  customer_phone: phone,
                  message: '',
                  status: 'pending',
                },
              ]);
              if (error) throw error;
              if (permission) {
                onSuccess && onSuccess();
                onClose();
              } else {
                onError && onError();
              }
            } catch (err) {
              onError && onError();
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
            The token amount will be sent to you by the property owner/agent via email, call, or WhatsApp after you submit your request.
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="booking-name">Name</label>
              <input id="booking-name" type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="booking-email">Email</label>
              <input id="booking-email" type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="booking-phone">Phone</label>
              <input id="booking-phone" type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className="flex items-center mt-2">
              <input type="checkbox" id="booking-permission" checked={permission} onChange={e => setPermission(e.target.checked)} className="mr-2" required />
              <label htmlFor="booking-permission" className="text-gray-700">I agree to share my details with the property owner/agent for this booking request.</label>
            </div>
          </div>
          <div className="pt-6 pb-2 bg-white sticky bottom-0 left-0 right-0 z-10">
            <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Sending...' : 'Send Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
