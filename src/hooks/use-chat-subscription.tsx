
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageType } from '@/services/ChatService';

export function useChatSubscription(conversationId: string | null) {
  const [newMessage, setNewMessage] = useState<MessageType | null>(null);
  
  useEffect(() => {
    if (!conversationId) return;
    
    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel('message-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setNewMessage(payload.new as MessageType);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);
  
  return newMessage;
}
