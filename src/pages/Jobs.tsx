import React, { useState, useEffect } from 'react';
import TopTabs from '@/components/TopTabs';
import JobListItem from '@/components/JobListItem';
import WorkerListItem from '@/components/WorkerListItem';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import AnimatedTransition from '@/components/AnimatedTransition';
import { JobService, JobType } from '@/services/JobService';
import { WorkerService, WorkerType } from '@/services/WorkerService';
import AddJobDialog from '@/components/AddJobDialog';
import AddWorkerDialog from '@/components/AddWorkerDialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
type TabType = 'jobs' | 'workers';
const Jobs: React.FC = () => {
  const {
    user
  } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [isLoaded, setIsLoaded] = useState(false);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [workers, setWorkers] = useState<WorkerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const jobsData = await JobService.getJobs();
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Xəta baş verdi",
        description: "İş elanları yüklənərkən xəta baş verdi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const workersData = await WorkerService.getWorkers();
      setWorkers(workersData);
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast({
        title: "Xəta baş verdi",
        description: "İşçi profilləri yüklənərkən xəta baş verdi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === 'jobs') {
        await fetchJobs();
      } else {
        await fetchWorkers();
      }
      setIsLoaded(true);
      setLoading(false);
    };
    loadData();
  }, [activeTab]);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    if (diffMins < 60) {
      return `${diffMins} dəqiqə əvvəl`;
    } else if (diffHours < 24) {
      return `${diffHours} saat əvvəl`;
    } else {
      return `${diffDays} gün əvvəl`;
    }
  };
  const handleAddButton = () => {
    if (!user) {
      toast({
        title: "Giriş tələb olunur",
        description: "Əlavə etmək üçün əvvəlcə hesabınıza daxil olun",
        variant: "destructive"
      });
      return;
    }
    if (activeTab === 'jobs') {
      setJobDialogOpen(true);
    } else {
      setWorkerDialogOpen(true);
    }
  };
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as TabType);
  };
  const tabs = [{
    id: 'jobs',
    label: 'İş'
  }, {
    id: 'workers',
    label: 'İşçi'
  }];
  if (!isLoaded) {
    return <div className="page-container flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="page-container pb-20">
      <TopTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="mt-4">
        {activeTab === 'jobs' ? <AnimatedTransition key="jobs" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Aktiv iş elanları (DEMO)</h2>
            
            {loading ? <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div> : jobs.length > 0 ? jobs.map(job => <JobListItem key={job.id} id={job.id} title={job.title} company={job.company} location={job.location} experience_level={job.experience_level} salary_range={job.salary_range} work_mode={job.work_mode} postedTime={formatDate(job.created_at)} />) : <div className="text-center py-8 text-gray-500">
                Hələ heç bir iş elanı yoxdur. İlk elanı siz əlavə edin!
              </div>}
          </AnimatedTransition> : <AnimatedTransition key="workers" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">İş axtaran işçilər (DEMO)</h2>
            
            {loading ? <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div> : workers.length > 0 ? workers.map(worker => <WorkerListItem key={worker.id} id={worker.id} name={`${worker.name} ${worker.surname}`} profession={worker.profession} skills={worker.skills} location={worker.location} postedTime={formatDate(worker.created_at)} />) : <div className="text-center py-8 text-gray-500">
                Hələ heç bir işçi profili yoxdur. İlk profili siz əlavə edin!
              </div>}
          </AnimatedTransition>}
      </div>
      
      <Button size="icon" className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg" onClick={handleAddButton}>
        <Plus className="h-6 w-6" />
      </Button>
      
      <AddJobDialog open={jobDialogOpen} onOpenChange={setJobDialogOpen} onJobAdded={fetchJobs} />
      
      <AddWorkerDialog open={workerDialogOpen} onOpenChange={setWorkerDialogOpen} onWorkerAdded={fetchWorkers} />
    </div>;
};
export default Jobs;
