
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MessageType } from '@/services/ChatService';
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { Loader2 } from 'lucide-react';
import { useChatSubscription } from '@/hooks/use-chat-subscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Chat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [otherUser, setOtherUser] = useState<{ id: string; name: string; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const newMessage = useChatSubscription(conversationId || null);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    
    if (!conversationId) {
      navigate('/inbox', { replace: true });
      return;
    }
    
    // Fetch messages and conversation details
    fetchConversationDetails();
  }, [conversationId, user]);
  
  useEffect(() => {
    if (newMessage && !messages.some(m => m.id === newMessage.id)) {
      setMessages(prev => [...prev, newMessage]);
      
      // Mark message as read if it's not from the current user
      if (newMessage.sender_id !== user?.id) {
        markMessageAsRead(newMessage.id);
      }
    }
  }, [newMessage]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const fetchConversationDetails = async () => {
    try {
      setLoading(true);
      
      if (!conversationId || !user?.id) {
        throw new Error("Missing conversation ID or user");
      }
      
      // Get all participants in this conversation
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId);
      
      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        throw participantsError;
      }
      
      if (!participants || participants.length === 0) {
        throw new Error("No participants found in this conversation");
      }
      
      // Check if current user is a participant
      const isParticipant = participants.some(p => p.user_id === user.id);
      
      if (!isParticipant) {
        throw new Error("You are not a participant of this conversation");
      }
      
      // Get the other participant (not the current user)
      const otherParticipant = participants.find(p => p.user_id !== user.id);
      
      if (!otherParticipant) {
        throw new Error("Could not find other participant");
      }
      
      // Fetch the other user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, surname, avatar_url')
        .eq('id', otherParticipant.user_id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }
      
      setOtherUser({
        id: profile.id,
        name: `${profile.name || ''} ${profile.surname || ''}`.trim() || 'İstifadəçi',
        avatar_url: profile.avatar_url
      });
      
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }
      
      setMessages(messagesData || []);
      
      // Mark unread messages as read
      const unreadMessages = (messagesData || [])
        .filter(m => !m.read && m.sender_id !== user.id)
        .map(m => m.id);
      
      if (unreadMessages.length > 0) {
        await markMessagesAsRead(unreadMessages);
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      toast({
        title: "Xəta baş verdi",
        description: "Söhbət yüklənə bilmədi",
        variant: "destructive",
      });
      navigate('/inbox', { replace: true });
    } finally {
      setLoading(false);
    }
  };
  
  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };
  
  const markMessagesAsRead = async (messageIds: string[]) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  const handleSendMessage = async (content: string) => {
    if (!conversationId || !content.trim()) return;
    
    try {
      setSendingMessage(true);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user?.id,
          content: content.trim()
        });
      
      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Xəta baş verdi",
          description: "Mesaj göndərilə bilmədi",
          variant: "destructive",
        });
        throw error;
      }
      
      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
        
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="p-4 border-b border-border">
          <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {otherUser && (
        <ChatHeader
          name={otherUser.name}
          avatarUrl={otherUser.avatar_url}
          userId={otherUser.id}
        />
      )}
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Söhbətə başlamaq üçün mesaj göndərin</p>
          </div>
        ) : (
          messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={sendingMessage} />
    </div>
  );
};

export default Chat;
