
import React, { useState, useEffect } from 'react';
import TopTabs from '@/components/TopTabs';
import WorkerListItem from '@/components/WorkerListItem';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Loader2, ArrowUp10, ArrowDown01 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { WorkerService, WorkerType } from '@/services/WorkerService';
import AddWorkerDialog from '@/components/AddWorkerDialog';
import SearchDialog from '@/components/SearchDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Workers: React.FC = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<WorkerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(workers.length / itemsPerPage);

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
      setCurrentPage(1); // Reset to first page when data changes
    } catch (error) {
      console.error("Error fetching workers:", error);
      setError("İşçi elanları yüklənərkən xəta baş verdi.");
    } finally {
      setIsLoading(false);
    }
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

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
  };

  const tabs = [
    { id: 'all', label: 'Bütün işçi elanları' },
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

  // Sort workers based on created_at date
  const sortedWorkers = [...workers].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Calculate current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedWorkers.slice(indexOfFirstItem, indexOfLastItem);

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
            <ChevronLeft className="h-4 w-4" />
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
              Yeni işçi elanı
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <TopTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {sortOrder === 'newest' ? (
                <ArrowDown01 className="h-4 w-4" />
              ) : (
                <ArrowUp10 className="h-4 w-4" />
              )}
              <span>Sırala</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background">
            <DropdownMenuItem 
              onClick={() => handleSortChange('oldest')}
              className={sortOrder === 'oldest' ? "bg-secondary/20" : ""}
            >
              <ArrowUp10 className="mr-2 h-4 w-4" />
              <span>Köhnədən yeniyə</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleSortChange('newest')}
              className={sortOrder === 'newest' ? "bg-secondary/20" : ""}
            >
              <ArrowDown01 className="mr-2 h-4 w-4" />
              <span>Yenidən köhnəyə</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : currentItems.length > 0 ? (
        <>
          <div className="space-y-4 mt-4">
            {currentItems.map((worker) => (
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
          
          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-6 gap-2">
            <Button 
              variant="outline" 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium mx-2">
              {currentPage} / {totalPages || 1}
            </span>
            
            <Button 
              variant="outline" 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages || totalPages === 0}
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">Hal-hazırda aktiv işçi profili yoxdur</p>
          {user && (
            <Button onClick={handleAddWorker}>
              <Plus className="w-4 h-4 mr-2" />
              İşçi elanı yarat
            </Button>
          )}
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
