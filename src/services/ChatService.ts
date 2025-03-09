
import { supabase } from '@/integrations/supabase/client';

export type MessageType = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

export type ConversationType = {
  id: string;
  created_at: string;
  updated_at: string;
  participants?: { id: string; name: string; avatar_url: string | null }[];
  last_message?: MessageType;
};

export const ChatService = {
  async getConversations(): Promise<ConversationType[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return [];
      
      // Get all conversations directly without using conversation_participants
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false });
      
      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        return [];
      }
      
      if (!conversations?.length) return [];
      
      // Get participants for each conversation
      const result = await Promise.all(
        conversations.map(async (conversation) => {
          // For each conversation, check if the current user is a participant
          const { data: currentUserParticipant, error: currentUserError } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversation.id)
            .eq('user_id', user.user!.id)
            .maybeSingle();
          
          // Skip conversations where the current user is not a participant
          if (currentUserError || !currentUserParticipant) {
            return null;
          }
          
          // Get all participants of this conversation
          const { data: allParticipants, error: participantsError } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversation.id);
          
          if (participantsError || !allParticipants?.length) {
            return conversation;
          }
          
          // Get the other participant's ID (not the current user)
          const otherParticipantIds = allParticipants
            .filter(p => p.user_id !== user.user!.id)
            .map(p => p.user_id);
          
          if (otherParticipantIds.length === 0) return conversation;
          
          // Get the profiles of the other participants
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, surname, avatar_url')
            .in('id', otherParticipantIds);
          
          if (profilesError || !profiles?.length) {
            return conversation;
          }
          
          // Get the last message in the conversation
          const { data: lastMessage, error: lastMessageError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (lastMessageError && lastMessageError.code !== 'PGRST116') { // Not found error
            console.error('Error fetching last message:', lastMessageError);
          }
          
          return {
            ...conversation,
            participants: profiles.map(profile => ({
              id: profile.id,
              name: `${profile.name || ''} ${profile.surname || ''}`.trim() || 'İstifadəçi',
              avatar_url: profile.avatar_url
            })),
            last_message: lastMessage || undefined
          };
        })
      );
      
      // Filter out null results (conversations where user is not a participant)
      return result.filter(conv => conv !== null) as ConversationType[];
    } catch (error) {
      console.error('Error in getConversations:', error);
      return [];
    }
  },
  
  async getMessages(conversationId: string): Promise<MessageType[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  },
  
  async sendMessage(conversationId: string, content: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return { success: false, error: 'User not authenticated' };
      
      // Insert the message
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.user.id,
          content,
        });
      
      if (error) {
        console.error('Error sending message:', error);
        return { success: false, error: error.message };
      }
      
      // Update the conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      return { success: false, error: error.message };
    }
  },
  
  async markAsRead(messageIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      if (messageIds.length === 0) return { success: true };
      
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);
      
      if (error) {
        console.error('Error marking messages as read:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error in markAsRead:', error);
      return { success: false, error: error.message };
    }
  },
  
  async getOrCreateConversation(otherUserId: string): Promise<{ conversationId: string | null; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return { conversationId: null, error: 'User not authenticated' };
      
      // First check if conversation already exists between these users
      // Get all conversations the current user is in
      const { data: userConversations, error: userConvError } = await supabase
        .from('conversations')
        .select(`
          id,
          conversation_participants!inner(user_id)
        `)
        .contains('conversation_participants.user_id', [user.user.id]);
      
      if (userConvError) {
        console.error('Error finding user conversations:', userConvError);
        return { conversationId: null, error: userConvError.message };
      }
      
      // For each conversation, check if the other user is also a participant
      if (userConversations && userConversations.length > 0) {
        for (const conv of userConversations) {
          const { data: participants, error: participantsError } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id);
          
          if (!participantsError && participants) {
            // Check if both users are in this conversation and it's just the two of them
            const participantIds = participants.map(p => p.user_id);
            if (participantIds.includes(otherUserId) && participants.length === 2) {
              return { conversationId: conv.id };
            }
          }
        }
      }
      
      // If no existing conversation found, create a new one
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating conversation:', createError);
        return { conversationId: null, error: createError.message };
      }
      
      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConversation.id, user_id: user.user.id },
          { conversation_id: newConversation.id, user_id: otherUserId }
        ]);
      
      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        return { conversationId: null, error: participantsError.message };
      }
      
      return { conversationId: newConversation.id };
    } catch (error: any) {
      console.error('Error in getOrCreateConversation:', error);
      return { conversationId: null, error: error.message };
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return 0;
      
      // Get all conversations the user is part of in a way that avoids infinite recursion
      const { data: userParticipations, error: participantError } = await supabase
        .from('conversations')
        .select(`
          id,
          conversation_participants!inner(user_id)
        `)
        .contains('conversation_participants.user_id', [user.user.id]);
      
      if (participantError || !userParticipations?.length) return 0;
      
      const conversationIds = userParticipations.map(c => c.id);
      
      // Count unread messages in these conversations that weren't sent by the current user
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('read', false)
        .neq('sender_id', user.user.id);
      
      if (error) {
        console.error('Error counting unread messages:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }
};
