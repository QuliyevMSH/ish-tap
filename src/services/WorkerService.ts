
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type WorkerType = {
  id: string;
  user_id: string;
  name: string;
  surname: string;
  profession: string;
  skills: string[];
  location: string;
  created_at: string;
};

export const WorkerService = {
  async getWorkers(): Promise<WorkerType[]> {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as WorkerType[];
    } catch (error: any) {
      console.error('Error fetching workers:', error);
      return [];
    }
  },
  
  async getUserWorker(): Promise<WorkerType | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return null;
      
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      return data as WorkerType;
    } catch (error: any) {
      console.error('Error fetching user worker profile:', error);
      return null;
    }
  },
  
  async getWorkerById(id: string): Promise<WorkerType | null> {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      
      return data as WorkerType;
    } catch (error: any) {
      console.error('Error fetching worker profile:', error);
      return null;
    }
  },
  
  async getWorkersByUserId(userId: string): Promise<WorkerType[]> {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as WorkerType[];
    } catch (error: any) {
      console.error('Error fetching user worker profiles:', error);
      return [];
    }
  },
  
  async addWorker(worker: Omit<WorkerType, 'id' | 'user_id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return { success: false, error: 'User not authenticated' };
      
      const { error } = await supabase
        .from('workers')
        .insert({
          user_id: user.user.id,
          name: worker.name,
          surname: worker.surname,
          profession: worker.profession,
          skills: worker.skills,
          location: worker.location,
        });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error adding worker profile:', error);
      return { success: false, error: error.message };
    }
  },
  
  async updateWorker(id: string, worker: Partial<Omit<WorkerType, 'id' | 'user_id' | 'created_at'>>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('workers')
        .update({
          name: worker.name,
          surname: worker.surname,
          profession: worker.profession,
          skills: worker.skills,
          location: worker.location,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating worker profile:', error);
      return { success: false, error: error.message };
    }
  },
  
  async deleteWorker(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting worker profile:', error);
      return { success: false, error: error.message };
    }
  }
};
