
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessageType } from '@/services/ChatService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuth();
  const isOwn = user?.id === message.sender_id;
  
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-2 break-words",
          isOwn 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-muted rounded-tl-none"
        )}
      >
        <p className="text-sm">{message.content}</p>
        <p className="text-xs opacity-70 text-right mt-1">
          {format(new Date(message.created_at), 'HH:mm')}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
