
import { supabase } from '@/integrations/supabase/client';

export interface JobApplicantType {
  id: string;
  job_id: string;
  user_id: string;
  created_at: string;
}

export const JobApplicantService = {
  async getApplicants(jobId: string): Promise<JobApplicantType[]> {
    const { data, error } = await supabase
      .from('job_applicants')
      .select('*')
      .eq('job_id', jobId);
      
    if (error) {
      console.error('Error fetching job applicants:', error);
      return [];
    }
    
    return data;
  },
  
  async applyToJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { success: false, error: 'Not authenticated' };
    
    const { error } = await supabase
      .from('job_applicants')
      .insert({ job_id: jobId, user_id: user.user.id });
      
    if (error) {
      if (error.code === '23505') { // Unique violation
        const { error: deleteError } = await supabase
          .from('job_applicants')
          .delete()
          .eq('job_id', jobId)
          .eq('user_id', user.user.id);
          
        return { success: !deleteError, error: deleteError?.message };
      }
      return { success: false, error: error.message };
    }
    
    return { success: true };
  },
};
