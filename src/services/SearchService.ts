
import { supabase } from '@/integrations/supabase/client';
import { ProfileType } from './ProfileService';
import { JobType } from './JobService';
import { WorkerType } from './WorkerService';

export type SearchResultType = {
  id: string;
  type: 'profile' | 'job' | 'worker';
  title: string;
  subtitle: string;
  avatar_url?: string | null;
};

export const SearchService = {
  async searchAll(query: string): Promise<SearchResultType[]> {
    if (!query || query.length < 2) return [];
    
    try {
      const results: SearchResultType[] = [];
      
      // Search profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, surname, username, avatar_url, profession')
        .or(`name.ilike.%${query}%, surname.ilike.%${query}%, username.ilike.%${query}%`)
        .limit(5);
      
      if (profilesError) throw profilesError;
      
      if (profiles) {
        profiles.forEach((profile) => {
          results.push({
            id: profile.id,
            type: 'profile',
            title: `${profile.name || ''} ${profile.surname || ''}`.trim(),
            subtitle: profile.username ? `@${profile.username}` : (profile.profession || ''),
            avatar_url: profile.avatar_url,
          });
        });
      }
      
      // Search jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, company, location')
        .or(`title.ilike.%${query}%, company.ilike.%${query}%, location.ilike.%${query}%`)
        .limit(5);
      
      if (jobsError) throw jobsError;
      
      if (jobs) {
        jobs.forEach((job) => {
          results.push({
            id: job.id,
            type: 'job',
            title: job.title,
            subtitle: `${job.company} · ${job.location}`,
          });
        });
      }
      
      // Search workers
      const { data: workers, error: workersError } = await supabase
        .from('workers')
        .select('id, name, surname, profession, location')
        .or(`name.ilike.%${query}%, surname.ilike.%${query}%, profession.ilike.%${query}%`)
        .limit(5);
      
      if (workersError) throw workersError;
      
      if (workers) {
        workers.forEach((worker) => {
          results.push({
            id: worker.id,
            type: 'worker',
            title: `${worker.name} ${worker.surname}`,
            subtitle: `${worker.profession} · ${worker.location}`,
          });
        });
      }
      
      return results;
      
    } catch (error) {
      console.error('Error searching:', error);
      return [];
    }
  }
};
