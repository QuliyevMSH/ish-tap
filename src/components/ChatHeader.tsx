
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface ChatHeaderProps {
  name: string;
  avatarUrl?: string | null;
  userId: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ name, avatarUrl, userId }) => {
  const navigate = useNavigate();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleProfileClick = () => {
    navigate(`/profile/${userId}`);
  };
  
  return (
    <div className="p-4 border-b border-border flex items-center gap-3">
      <Button variant="ghost" size="icon" onClick={handleBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={handleProfileClick}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-foreground">{name}</h3>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
