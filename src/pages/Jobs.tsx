
import React, { useState, useEffect } from 'react';
import TopTabs from '@/components/TopTabs';
import JobListItem from '@/components/JobListItem';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCcw, Loader2, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { JobService, JobType } from '@/services/JobService';
import AddJobDialog from '@/components/AddJobDialog';
import SearchDialog from '@/components/SearchDialog';

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let data: JobType[];
      
      if (activeTab === 'all') {
        data = await JobService.getJobs();
      } else if (activeTab === 'my' && user) {
        data = await JobService.getUserJobs(user.id);
      } else {
        data = await JobService.getJobs();
      }
      
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("İş elanları yüklənərkən xəta baş verdi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await fetchJobs();
    setIsRefreshing(false);
  };

  const handleAddJob = () => {
    setDialogOpen(true);
  };

  const handleJobAdded = async () => {
    await fetchJobs();
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const tabs = [
    { id: 'all', label: 'Bütün elanlar' },
    { id: 'my', label: 'Mənim elanlarım' }
  ];

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

  if (error) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-12">
        <div className="text-center mb-6">
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            onClick={fetchJobs} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Yenidən cəhd edin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pb-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">İş elanları</h1>
        <div className="flex items-center gap-2">
          <SearchDialog className="text-muted-foreground hover:text-foreground" />
          {user && (
            <Button 
              size="sm" 
              onClick={handleAddJob}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Yeni iş elanı
            </Button>
          )}
        </div>
      </div>

      <TopTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-4 mt-4">
          {jobs.map((job) => (
            <JobListItem 
              key={job.id}
              id={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
              experience_level={job.experience_level}
              salary_range={job.salary_range}
              work_mode={job.work_mode}
              postedTime={formatDate(job.created_at)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">Hal-hazırda aktiv iş elanı yoxdur</p>
          {user && (
            <Button onClick={handleAddJob}>
              <Plus className="w-4 h-4 mr-2" />
              İş elanı əlavə et
            </Button>
          )}
        </div>
      )}

      {!isLoading && jobs.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            {isRefreshing ? 'Yenilənir...' : 'Yenilə'}
          </Button>
        </div>
      )}

      <AddJobDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onJobAdded={handleJobAdded}
      />
    </div>
  );
};

export default Jobs;
