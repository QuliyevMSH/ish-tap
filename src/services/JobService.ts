
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type JobType = {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location: string;
  requirements?: string;
  experience_level?: string;
  salary_range?: string;
  work_mode?: string;
  contact_info?: string;
  application_form?: string;
  created_at: string;
};

export const JobService = {
  async getJobs(): Promise<JobType[]> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as JobType[];
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },
  
  async getUserJobs(userId?: string): Promise<JobType[]> {
    try {
      // If no userId is provided, use the current authenticated user
      if (!userId) {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return [];
        userId = user.user.id;
      }
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as JobType[];
    } catch (error: any) {
      console.error('Error fetching user jobs:', error);
      return [];
    }
  },
  
  async getJobById(id: string): Promise<JobType | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as JobType;
    } catch (error: any) {
      console.error('Error fetching job:', error);
      return null;
    }
  },
  
  async addJob(job: Omit<JobType, 'id' | 'user_id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return { success: false, error: 'User not authenticated' };
      
      const { error } = await supabase
        .from('jobs')
        .insert({
          user_id: user.user.id,
          title: job.title,
          company: job.company,
          location: job.location,
          requirements: job.requirements,
          experience_level: job.experience_level,
          salary_range: job.salary_range,
          work_mode: job.work_mode,
          contact_info: job.contact_info,
          application_form: job.application_form,
        });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error adding job:', error);
      return { success: false, error: error.message };
    }
  },
  
  async updateJob(id: string, job: Partial<Omit<JobType, 'id' | 'user_id' | 'created_at'>>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: job.title,
          company: job.company,
          location: job.location,
          requirements: job.requirements,
          experience_level: job.experience_level,
          salary_range: job.salary_range,
          work_mode: job.work_mode,
          contact_info: job.contact_info,
          application_form: job.application_form,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating job:', error);
      return { success: false, error: error.message };
    }
  },
  
  async deleteJob(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting job:', error);
      return { success: false, error: error.message };
    }
  }
};
