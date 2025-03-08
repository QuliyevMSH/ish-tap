
import { supabase } from '@/integrations/supabase/client';

export type ProfileType = {
  id: string;
  name: string | null;
  surname: string | null;
  profession: string | null;
  about: string | null;
  phone: string | null;
  avatar_url: string | null;
  username: string | null;
};

export const ProfileService = {
  async getProfile(): Promise<ProfileType | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      return data as ProfileType;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },
  
  async getProfileById(userId: string): Promise<ProfileType | null> {
    try {
      console.log("Fetching profile for user ID:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }
      
      console.log("Profile data retrieved:", data);
      return data as ProfileType;
    } catch (error) {
      console.error('Error fetching profile by ID:', error);
      return null;
    }
  },
  
  async updateProfile(profile: Partial<ProfileType>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return { success: false, error: 'User not authenticated' };
      
      // Check if username is already taken (by another user)
      if (profile.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', profile.username)
          .neq('id', user.user.id)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (existingUser) {
          return { 
            success: false, 
            error: 'Bu istifadəçi adı artıq istifadə olunur' 
          };
        }
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.user.id);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  },

  async uploadAvatar(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return { success: false, error: 'User not authenticated' };
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.user.id);
      
      if (updateError) throw updateError;
      
      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      return { success: false, error: error.message };
    }
  }
};
