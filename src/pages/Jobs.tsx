
import React, { useState, useEffect } from 'react';
import TopTabs from '@/components/TopTabs';
import JobListItem from '@/components/JobListItem';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Loader2, ArrowUp10, ArrowDown01 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { JobService, JobType } from '@/services/JobService';
import AddJobDialog from '@/components/AddJobDialog';
import SearchDialog from '@/components/SearchDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(jobs.length / itemsPerPage);

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
      setCurrentPage(1); // Reset to first page when data changes
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("İş elanları yüklənərkən xəta baş verdi.");
    } finally {
      setIsLoading(false);
    }
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

  // Sort jobs based on created_at date
  const sortedJobs = [...jobs].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Calculate current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedJobs.slice(indexOfFirstItem, indexOfLastItem);

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
            {currentItems.map((job) => (
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
          <p className="text-lg text-muted-foreground mb-4">Hal-hazırda aktiv iş elanı yoxdur</p>
          {user && (
            <Button onClick={handleAddJob}>
              <Plus className="w-4 h-4 mr-2" />
              İş elanı əlavə et
            </Button>
          )}
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
