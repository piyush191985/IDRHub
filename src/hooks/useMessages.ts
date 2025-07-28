import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Message } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Conversation {
  id: string;
  participant: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  lastMessage: Message;
  unreadCount: number;
  property_id?: string;
}

export const useMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToMessages();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get all messages for the current user
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*),
          recipient:users!messages_recipient_id_fkey(*)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation
      const conversationMap = new Map<string, Conversation>();

      data?.forEach(message => {
        const otherUser = message.sender_id === user.id ? message.recipient : message.sender;
        const conversationId = message.conversation_id;

        if (!conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, {
            id: conversationId,
            participant: otherUser,
            lastMessage: message,
            unreadCount: 0,
            property_id: message.property_id,
          });
        }

        // Count unread messages
        if (message.recipient_id === user.id && !message.read) {
          const conv = conversationMap.get(conversationId)!;
          conv.unreadCount++;
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*),
          recipient:users!messages_recipient_id_fkey(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id);

    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendMessage = async (recipientId: string, content: string, conversationId?: string, propertyId?: string) => {
    if (!user) return;

    try {
      const messageId = crypto.randomUUID();
      const finalConversationId = conversationId || messageId;

      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: finalConversationId,
            sender_id: user.id,
            recipient_id: recipientId,
            content,
            property_id: propertyId,
          },
        ]);

      if (error) throw error;

      // Create notification for recipient
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: recipientId,
            title: 'New Message',
            message: `You have a new message from ${user.full_name}`,
            type: 'info',
            metadata: {
              sender_id: user.id,
              conversation_id: finalConversationId,
              property_id: propertyId,
            },
          },
        ]);

      await fetchConversations();
      if (conversationId) {
        await fetchMessages(conversationId);
      }

      return finalConversationId;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const sendPropertyInquiry = async (propertyId: string, agentId: string, message: string) => {
    if (!user) return;

    try {
      const conversationId = crypto.randomUUID();
      
      // Send the inquiry message
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: user.id,
            recipient_id: agentId,
            content: message,
            property_id: propertyId,
          },
        ]);

      if (error) throw error;

      // Create notification for agent
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: agentId,
            title: 'Property Inquiry',
            message: `${user.full_name} is interested in your property`,
            type: 'info',
            metadata: {
              sender_id: user.id,
              conversation_id: conversationId,
              property_id: propertyId,
            },
          },
        ]);

      await fetchConversations();
      return conversationId;
    } catch (err) {
      console.error('Error sending property inquiry:', err);
      throw err;
    }
  };

  const subscribeToMessages = () => {
    if (!user) return;

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  return {
    conversations,
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    sendPropertyInquiry,
    fetchConversations,
  };
};