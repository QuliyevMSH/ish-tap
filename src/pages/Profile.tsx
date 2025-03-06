
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileForm from '@/components/ProfileForm';
import JobListItem from '@/components/JobListItem';
import { LogOut, Loader2, Plus, ArrowLeft, MapPin, Phone, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { JobService, JobType } from '@/services/JobService';
import { WorkerService, WorkerType } from '@/services/WorkerService';
import { ProfileService, ProfileType } from '@/services/ProfileService';
import AddJobDialog from '@/components/AddJobDialog';
import { useNavigate, useParams } from 'react-router-dom';
import WorkerListItem from '@/components/WorkerListItem';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ThemeToggle from '@/components/ThemeToggle';

const Profile: React.FC = () => {
  const { signOut, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [userJobs, setUserJobs] = useState<JobType[]>([]);
  const [userWorkers, setUserWorkers] = useState<WorkerType[]>([]);
  const [userProfile, setUserProfile] = useState<ProfileType | null>(null);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isViewingOtherProfile, setIsViewingOtherProfile] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (userId && user && userId !== user.id) {
      setIsViewingOtherProfile(true);
    } else {
      setIsViewingOtherProfile(false);
    }

    const fetchUserData = async () => {
      setJobsLoading(true);
      setWorkersLoading(true);
      setProfileLoading(true);
      
      const targetUserId = userId || (user ? user.id : '');
      if (targetUserId) {
        try {
          const profileData = await ProfileService.getProfileById(targetUserId);
          setUserProfile(profileData);
          setProfileLoading(false);
          
          const jobsData = await JobService.getUserJobs(targetUserId);
          setUserJobs(jobsData);
          
          const workersData = await WorkerService.getWorkersByUserId(targetUserId);
          setUserWorkers(workersData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      
      setJobsLoading(false);
      setWorkersLoading(false);
    };
    
    if (isLoaded) {
      fetchUserData();
    }
  }, [user, userId, isLoaded]);
  
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
  
  const handleAddJob = () => {
    setDialogOpen(true);
  };
  
  const handleJobAdded = async () => {
    if (user) {
      const jobsData = await JobService.getUserJobs(user.id);
      setUserJobs(jobsData);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getAvatarUrl = () => {
    if (userProfile?.avatar_url) return userProfile.avatar_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || '')}&surname=${encodeURIComponent(userProfile?.surname || '')}&background=0D8ABC&color=fff`;
  };

  if (authLoading || !isLoaded) {
    return (
      <div className="page-container flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container pb-20">
      {isViewingOtherProfile && (
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isViewingOtherProfile ? "İstifadəçi profili" : "Profilim"}
        </h1>
        {!isViewingOtherProfile && (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 text-gray-700 dark:text-gray-300"
              onClick={signOut}
              disabled={authLoading}
            >
              <LogOut className="w-4 h-4" />
              <span>Çıxış</span>
            </Button>
          </div>
        )}
      </div>

      {isViewingOtherProfile && (
        <Card className="mb-6 animate-fade-in">
          <CardContent className="pt-6">
            {profileLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userProfile ? (
              <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                <div className="shrink-0">
                  <Avatar className="w-24 h-24 border-2 border-background shadow-md">
                    <AvatarImage src={getAvatarUrl()} />
                    <AvatarFallback>{userProfile.name?.charAt(0) || ''}{userProfile.surname?.charAt(0) || ''}</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {userProfile.name} {userProfile.surname}
                    </h2>
                    
                    {userProfile.profession && (
                      <div className="flex items-center text-muted-foreground mt-1">
                        <Briefcase className="w-4 h-4 mr-2 text-primary" />
                        <span>{userProfile.profession}</span>
                      </div>
                    )}
                  </div>
                  
                  {userProfile.about && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Haqqında</h3>
                      <p className="text-foreground">{userProfile.about}</p>
                    </div>
                  )}
                  
                  {userProfile.phone && (
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2 text-secondary" />
                      <span>{userProfile.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                İstifadəçi profil məlumatları mövcud deyil
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue={isViewingOtherProfile ? "jobs" : "profile"} className="animate-fade-in">
        <TabsList className="mb-4 bg-muted/50 dark:bg-muted/30">
          {!isViewingOtherProfile && (
            <TabsTrigger value="profile">Profil məlumatları</TabsTrigger>
          )}
          <TabsTrigger value="jobs">İş elanları</TabsTrigger>
          <TabsTrigger value="workers">İşçi profili</TabsTrigger>
        </TabsList>
        
        {!isViewingOtherProfile && (
          <TabsContent value="profile">
            <Card>
              <CardContent className="pt-6">
                <ProfileForm />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        <TabsContent value="jobs">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {isViewingOtherProfile ? "İstifadəçinin iş elanları" : "Əlavə etdiyim iş elanları"}
                </h2>
                {!isViewingOtherProfile && (
                  <Button 
                    size="sm" 
                    onClick={handleAddJob}
                    className="flex items-center bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Yeni elan
                  </Button>
                )}
              </div>
              
              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userJobs.length > 0 ? (
                <div className="space-y-3">
                  {userJobs.map((job) => (
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
                <div className="text-center py-8 text-muted-foreground">
                  {isViewingOtherProfile ? "İstifadəçi hələ heç bir iş elanı əlavə etməyib" : "Hələ heç bir iş elanı əlavə etməmisiniz"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="workers">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {isViewingOtherProfile ? "İstifadəçinin işçi profili" : "İşçi profilim"}
                </h2>
              </div>
              
              {workersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userWorkers.length > 0 ? (
                <div className="space-y-3">
                  {userWorkers.map((worker) => (
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
                <div className="text-center py-8 text-muted-foreground">
                  {isViewingOtherProfile ? "İstifadəçi hələ işçi profili yaratmayıb" : "Hələ işçi profili yaratmamısınız"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {!isViewingOtherProfile && (
        <AddJobDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
          onJobAdded={handleJobAdded}
        />
      )}
    </div>
  );
};

export default Profile;
