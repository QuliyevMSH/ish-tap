
import React, { useState, useEffect } from 'react';
import TopTabs from '@/components/TopTabs';
import WorkerListItem from '@/components/WorkerListItem';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCcw, Loader2, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { WorkerService, WorkerType } from '@/services/WorkerService';
import AddWorkerDialog from '@/components/AddWorkerDialog';
import SearchDialog from '@/components/SearchDialog';

const Workers: React.FC = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<WorkerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchWorkers();
  }, [activeTab]);

  const fetchWorkers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let data: WorkerType[];
      
      if (activeTab === 'all') {
        data = await WorkerService.getWorkers();
      } else if (activeTab === 'my' && user) {
        data = await WorkerService.getWorkersByUserId(user.id);
      } else {
        data = await WorkerService.getWorkers();
      }
      
      setWorkers(data);
    } catch (error) {
      console.error("Error fetching workers:", error);
      setError("İşçilər yüklənərkən xəta baş verdi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await fetchWorkers();
    setIsRefreshing(false);
  };

  const handleAddWorker = () => {
    setDialogOpen(true);
  };

  const handleWorkerAdded = async () => {
    await fetchWorkers();
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const tabs = [
    { id: 'all', label: 'Bütün işçilər' },
    { id: 'my', label: 'Mənim profillərim' }
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
            onClick={fetchWorkers} 
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
        <h1 className="text-2xl font-bold">İşçilər</h1>
        <div className="flex items-center gap-2">
          <SearchDialog className="text-muted-foreground hover:text-foreground" />
          {user && (
            <Button 
              size="sm" 
              onClick={handleAddWorker}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              İşçi profili yarat
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
      ) : workers.length > 0 ? (
        <div className="space-y-4 mt-4">
          {workers.map((worker) => (
            <WorkerListItem 
              key={worker.id}
              id={worker.id}
              name={`${worker.name} ${worker.surname}`}
              profession={worker.profession}
              skills={worker.skills}
              location={worker.location}
              postedTime={formatDate(worker.created_at)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">Hal-hazırda aktiv işçi profili yoxdur</p>
          {user && (
            <Button onClick={handleAddWorker}>
              <Plus className="w-4 h-4 mr-2" />
              İşçi profili yarat
            </Button>
          )}
        </div>
      )}

      {!isLoading && workers.length > 0 && (
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

      <AddWorkerDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onWorkerAdded={handleWorkerAdded}
      />
    </div>
  );
};

export default Workers;
