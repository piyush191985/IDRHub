import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Phone, Mail, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Property, Agent } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

interface TourSchedulerProps {
  property: Property;
  agent: Agent;
  onClose: () => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export const TourScheduler: React.FC<TourSchedulerProps> = ({ property, agent, onClose }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      const { data: existingTours, error } = await supabase
        .from('tours')
        .select('scheduled_date')
        .eq('property_id', property.id)
        .eq('agent_id', agent.id)
        .gte('scheduled_date', `${selectedDate}T00:00:00`)
        .lt('scheduled_date', `${selectedDate}T23:59:59`);

      if (error) throw error;

      const bookedTimes = existingTours?.map(tour => 
        new Date(tour.scheduled_date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      ) || [];

      const slots = timeSlots.map(time => ({
        time,
        available: !bookedTimes.includes(time)
      }));

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to load available time slots');
    }
  };

  const handleScheduleTour = async () => {
    if (!user) {
      toast.error('Please sign in to schedule a tour');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    try {
      setLoading(true);

      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}:00`);

      const { error } = await supabase
        .from('tours')
        .insert({
          property_id: property.id,
          buyer_id: user.id,
          agent_id: agent.id,
          scheduled_date: scheduledDateTime.toISOString(),
          duration: 60,
          status: 'scheduled',
          notes: notes.trim() || null
        });

      if (error) throw error;

      // Create notification for agent
      await supabase
        .from('notifications')
        .insert({
          user_id: agent.id,
          title: 'New Tour Scheduled',
          message: `${user.full_name} has scheduled a tour for ${property.title} on ${scheduledDateTime.toLocaleDateString()} at ${selectedTime}`,
          type: 'info'
        });

      toast.success('Tour scheduled successfully! You will receive a confirmation email.');
      onClose();
    } catch (error) {
      console.error('Error scheduling tour:', error);
      toast.error('Failed to schedule tour. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Schedule Property Tour</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Property Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{property.address}, {property.city}, {property.state}</span>
            </div>
          </div>

          {/* Agent Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                {agent.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{agent.full_name}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {agent.phone && (
                    <span className="flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {agent.phone}
                    </span>
                  )}
                  {agent.email && (
                    <span className="flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {agent.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Select Date</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ‹
                  </button>
                  <h4 className="font-semibold">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ›
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((date, index) => (
                    <button
                      key={index}
                      onClick={() => date && isDateAvailable(date) && setSelectedDate(formatDate(date))}
                      disabled={!date || !isDateAvailable(date)}
                      className={`p-2 text-sm rounded-lg transition-colors ${
                        !date
                          ? 'invisible'
                          : !isDateAvailable(date)
                          ? 'text-gray-300 cursor-not-allowed'
                          : selectedDate === formatDate(date)
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {date?.getDate()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Select Time</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 text-sm rounded-lg transition-colors ${
                        slot.available
                          ? selectedTime === slot.time
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or questions for the agent..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleScheduleTour}
              disabled={loading || !selectedDate || !selectedTime}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Tour</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 