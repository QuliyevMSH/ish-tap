
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProfileService } from '@/services/ProfileService';
import { useState, useEffect } from 'react';

interface SendMessageButtonProps {
  userId: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const SendMessageButton: React.FC<SendMessageButtonProps> = ({ 
  userId, 
  variant = "secondary",
  size = "sm",
  className 
}) => {
  const { toast } = useToast();
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchUserPhone = async () => {
      try {
        setIsLoading(true);
        const profile = await ProfileService.getProfileById(userId);
        if (profile && profile.phone) {
          setUserPhone(profile.phone);
        }
      } catch (error) {
        console.error('Error fetching user phone:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPhone();
  }, [userId]);
  
  const handleWhatsAppRedirect = () => {
    if (!userPhone) {
      toast({
        title: "Telefon nömrəsi tapılmadı",
        description: "İstifadəçinin telefon nömrəsi profilində qeyd olunmayıb",
        variant: "destructive",
      });
      return;
    }
    
    // Format phone number for WhatsApp (remove spaces, +, etc)
    const formattedPhone = userPhone.replace(/\s+/g, '').replace(/^\+/, '');
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <Button 
      variant={variant} 
      size={size}
      className={className}
      onClick={handleWhatsAppRedirect}
      disabled={isLoading || !userPhone}
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      WhatsApp ilə yaz
    </Button>
  );
};

export default SendMessageButton;
