
import React, { useEffect, useState } from 'react';
import { ChatService, ConversationType } from '@/services/ChatService';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChatList from '@/components/ChatList';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Inbox: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    
    fetchConversations();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('conversation-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await ChatService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="page-container pb-20">
      <h1 className="text-2xl font-bold mb-6">Söhbətlər</h1>
      
      {loading && conversations.length === 0 ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <ChatList conversations={conversations} loading={loading} />
      )}
    </div>
  );
};

export default Inbox;
