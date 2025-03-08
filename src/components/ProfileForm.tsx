
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Camera, Loader2 } from 'lucide-react';
import { ProfileService, ProfileType } from '@/services/ProfileService';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ProfileForm: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProfileType>>({
    name: '',
    surname: '',
    profession: '',
    about: '',
    phone: '',
    avatar_url: '',
    username: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          setProfileLoading(true);
          setError(null);
          const profile = await ProfileService.getProfile();
          if (profile) {
            setFormData({
              name: profile.name || '',
              surname: profile.surname || '',
              profession: profile.profession || '',
              about: profile.about || '',
              phone: profile.phone || '',
              avatar_url: profile.avatar_url || '',
              username: profile.username || '',
            });
          }
        } catch (err) {
          console.error('Error loading profile:', err);
          setError('Profil məlumatları yüklənərkən xəta baş verdi.');
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'username') {
      // Clear previous errors
      setUsernameError(null);
      
      // Only allow alphanumeric characters and underscores
      if (!/^[a-zA-Z0-9_]*$/.test(value)) {
        setUsernameError('İstifadəçi adı yalnız hərf, rəqəm və alt xətt (_) ola bilər');
        return;
      }
      
      if (value.length > 0 && value.length < 3) {
        setUsernameError('İstifadəçi adı ən az 3 simvol olmalıdır');
      }
      
      // Check if username already exists (only if it has changed)
      if (value !== formData.username && value.length >= 3) {
        try {
          const { data, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', value)
            .neq('id', user?.id || '')
            .maybeSingle();
          
          if (checkError) throw checkError;
          
          if (data) {
            setUsernameError('Bu istifadəçi adı artıq istifadə olunur');
            return;
          }
        } catch (err) {
          console.error('Error checking username:', err);
        }
      }
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (!formData.username || formData.username.length < 3) {
      setUsernameError('İstifadəçi adı ən az 3 simvol olmalıdır');
      return;
    }
    
    if (usernameError) {
      toast({
        title: "Xəta baş verdi",
        description: "Zəhmət olmasa istifadəçi adını düzəldin",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const { success, error } = await ProfileService.updateProfile(formData);
    
    if (success) {
      toast({
        title: "Profil yeniləndi",
        description: "Məlumatlarınız uğurla saxlanıldı.",
      });
    } else {
      toast({
        title: "Xəta baş verdi",
        description: error || "Profil yenilənərkən xəta baş verdi.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleAvatarClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = handleFileChange;
    fileInput.click();
  };

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    
    const file = target.files[0];
    setAvatarLoading(true);
    
    const { success, url, error } = await ProfileService.uploadAvatar(file);
    
    if (success && url) {
      setFormData(prev => ({ ...prev, avatar_url: url }));
      toast({
        title: "Şəkil yükləndi",
        description: "Profil şəkliniz uğurla yeniləndi.",
      });
    } else {
      toast({
        title: "Xəta baş verdi",
        description: error || "Şəkil yüklənərkən xəta baş verdi.",
        variant: "destructive",
      });
    }
    
    setAvatarLoading(false);
  };

  const getAvatarUrl = () => {
    if (formData.avatar_url) return formData.avatar_url;
    return `https://ui-avatars.com/api/?name=${formData.name}+${formData.surname}&background=0D8ABC&color=fff`;
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Yenidən cəhd edin
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center">
        <div className="relative group">
          <Avatar className="w-24 h-24 border-2 border-white shadow-md">
            <AvatarImage src={getAvatarUrl()} />
            <AvatarFallback>{formData.name?.charAt(0) || ''}{formData.surname?.charAt(0) || ''}</AvatarFallback>
          </Avatar>
          <div 
            className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handleAvatarClick}
          >
            {avatarLoading ? (
              <Loader2 className="text-white w-6 h-6 animate-spin" />
            ) : (
              <Camera className="text-white w-6 h-6" />
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="username">İstifadəçi adı</Label>
        <Input 
          id="username" 
          name="username"
          value={formData.username || ''}
          onChange={handleChange}
          placeholder="İstifadəçi adı" 
          required
        />
        {usernameError && (
          <div className="text-sm text-red-500 flex items-center mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {usernameError}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Ad</Label>
          <Input 
            id="name" 
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="Adınız" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="surname">Soyad</Label>
          <Input 
            id="surname" 
            name="surname"
            value={formData.surname || ''}
            onChange={handleChange}
            placeholder="Soyadınız" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="profession">İxtisas</Label>
        <Input 
          id="profession" 
          name="profession"
          value={formData.profession || ''}
          onChange={handleChange}
          placeholder="İxtisasınız" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="about">Haqqında</Label>
        <Textarea 
          id="about" 
          name="about"
          value={formData.about || ''}
          onChange={handleChange}
          placeholder="Özünüz haqqında məlumat" 
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input 
          id="phone" 
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          placeholder="Telefon nömrəniz" 
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saxlanılır...
          </span>
        ) : 'Yadda saxla'}
      </Button>
    </form>
  );
};

export default ProfileForm;
