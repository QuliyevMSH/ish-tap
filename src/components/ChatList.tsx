
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ConversationType } from '@/services/ChatService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface ChatListProps {
  conversations: ConversationType[];
  loading: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ conversations, loading }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: az });
    } catch (e) {
      return '';
    }
  };
  
  const handleChatClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };
  
  if (loading) {
    return (
      <div className="px-4 py-8 text-center text-muted-foreground">
        Söhbətlər yüklənir...
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-muted-foreground">
        Hələ ki, mesaj yoxdur.
      </div>
    );
  }
  
  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => {
        const otherUser = conversation.participants?.[0];
        const lastMessage = conversation.last_message;
        const isUnread = lastMessage && !lastMessage.read && lastMessage.sender_id !== user?.id;
        
        return (
          <div
            key={conversation.id}
            className="p-4 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleChatClick(conversation.id)}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser?.avatar_url || undefined} />
              <AvatarFallback>{otherUser ? getInitials(otherUser.name) : '??'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className={cn("font-medium truncate", isUnread && "font-bold")}>
                  {otherUser?.name || 'Bilinməyən istifadəçi'}
                </h3>
                {lastMessage && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(lastMessage.created_at)}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <p className={cn("text-sm text-muted-foreground truncate max-w-[85%]", isUnread && "text-foreground font-medium")}>
                  {lastMessage ? (
                    lastMessage.sender_id === user?.id ? 
                    `Siz: ${lastMessage.content}` : 
                    lastMessage.content
                  ) : 'Mesaj yoxdur'}
                </p>
                {isUnread && (
                  <Badge variant="default" className="rounded-full h-2 w-2 p-0" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
