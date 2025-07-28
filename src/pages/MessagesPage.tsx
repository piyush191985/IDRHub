import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Search, 
  User, 
  Clock,
  CheckCheck,
  Plus,
  Building,
  MapPin
} from 'lucide-react';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../utils/format';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import { UserAvatar } from '../components/common/UserAvatar';
import AgentDashboardLayout from '../components/common/AgentDashboardLayout';

interface ConversationWithProperty {
  id: string;
  participant: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  lastMessage: any;
  unreadCount: number;
  property?: Property;
}

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { conversations, messages, loading, fetchMessages, sendMessage } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversationsWithProperties, setConversationsWithProperties] = useState<ConversationWithProperty[]>([]);

  useEffect(() => {
    if (conversations.length > 0) {
      fetchConversationsWithProperties();
    }
  }, [conversations]);

  const fetchConversationsWithProperties = async () => {
    const conversationsWithProps = await Promise.all(
      conversations.map(async (conv) => {
        if (conv.property_id) {
          try {
            const { data: property } = await supabase
              .from('properties')
              .select('*')
              .eq('id', conv.property_id)
              .single();
            
            return {
              ...conv,
              property: property || undefined
            };
          } catch (error) {
            console.error('Error fetching property:', error);
            return conv;
          }
        }
        return conv;
      })
    );
    
    setConversationsWithProperties(conversationsWithProps);
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    fetchMessages(conversationId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversationsWithProperties.find(c => c.id === selectedConversation);
    if (!conversation) return;

    try {
      await sendMessage(conversation.participant.id, newMessage.trim(), selectedConversation, conversation.property?.id);
      setNewMessage('');
      fetchMessages(selectedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };



  const filteredConversations = conversationsWithProperties.filter(conv =>
    conv.participant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.property?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your messages</p>
          <Link
            to="/signin"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const pageContent = (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                  <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No conversations yet</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredConversations.map((conversation) => (
                      <motion.button
                        key={conversation.id}
                        onClick={() => handleConversationSelect(conversation.id)}
                        className={`w-full p-4 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                          selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start space-x-3">
                          <UserAvatar user={conversation.participant} size="lg" className="flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 truncate">
                                {conversation.participant.full_name}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 capitalize mb-1">
                              {conversation.participant.role}
                            </p>
                            
                            {/* Property Info */}
                            {conversation.property && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                                <Building className="w-3 h-3" />
                                <span className="truncate">{conversation.property.title}</span>
                              </div>
                            )}
                            
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatRelativeTime(conversation.lastMessage.created_at)}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col min-h-0">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-200">
                    {(() => {
                      const conversation = conversationsWithProperties.find(c => c.id === selectedConversation);
                      return conversation ? (
                        <div className="flex items-center space-x-3">
                          <UserAvatar user={conversation.participant} size="md" />
                          <div className="flex-1">
                            <h2 className="font-semibold text-gray-900">
                              {conversation.participant.full_name}
                            </h2>
                            <p className="text-sm text-gray-600 capitalize">
                              {conversation.participant.role}
                            </p>
                            {conversation.property && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                                <Building className="w-3 h-3" />
                                <span>{conversation.property.title}</span>
                                <span>•</span>
                                <MapPin className="w-3 h-3" />
                                <span>{conversation.property.city}, {conversation.property.state}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Messages */}
                  <div className="messages-container flex-1 min-h-0 overflow-y-auto p-6 flex flex-col justify-end space-y-4" style={{ scrollBehavior: 'auto' }}>
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-end space-x-1 mt-1 ${
                              message.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">
                                {formatRelativeTime(message.created_at)}
                              </span>
                              {message.sender_id === user.id && message.read && (
                                <CheckCheck className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex space-x-4">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500">
                      Choose a conversation from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (user?.role === 'agent') {
    return (
      <AgentDashboardLayout hideHeader={true}>
        {pageContent}
      </AgentDashboardLayout>
    );
  }
  return pageContent;
};