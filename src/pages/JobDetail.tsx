import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobService, JobType } from '@/services/JobService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Edit, Trash2, Briefcase, MapPin, Building, Banknote, Clock3, Phone, FileText, ArrowLeft, Loader2, Calendar, Heart, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import EditJobDialog from '@/components/EditJobDialog';
import DeleteJobDialog from '@/components/DeleteJobDialog';
import { JobApplicantService } from '@/services/JobApplicantService';
import JobApplicants from '@/components/JobApplicants';
import { ProfileService, ProfileType } from '@/services/ProfileService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const JobDetail: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [job, setJob] = useState<JobType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicantProfiles, setApplicantProfiles] = useState<ProfileType[]>([]);
  const [isApplied, setIsApplied] = useState(false);
  const [showAllApplicants, setShowAllApplicants] = useState(false);
  const [applicantsLoading, setApplicantsLoading] = useState(true);
  const [posterProfile, setPosterProfile] = useState<ProfileType | null>(null);
  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setLoading(true);
      const jobData = await JobService.getJobById(id);
      if (jobData) {
        setJob(jobData);
        if (jobData.user_id) {
          const profile = await ProfileService.getProfileById(jobData.user_id);
          setPosterProfile(profile);
        }
        if (user && user.id === jobData.user_id) {
          setIsOwner(true);
        }
      } else {
        toast({
          title: "İş elanı tapılmadı",
          description: "Axtardığınız iş elanı mövcud deyil və ya silinib",
          variant: "destructive"
        });
        navigate('/jobs');
      }
      setLoading(false);
    };
    const fetchApplicants = async () => {
      if (!id) return;
      setApplicantsLoading(true);
      try {
        const applicants = await JobApplicantService.getApplicants(id);
        if (applicants.length > 0) {
          const profiles = await Promise.all(applicants.map(applicant => ProfileService.getProfileById(applicant.user_id)));
          const validProfiles = profiles.filter((profile): profile is ProfileType => profile !== null);
          setApplicantProfiles(validProfiles);
          if (user) {
            setIsApplied(applicants.some(app => app.user_id === user.id));
          }
        } else {
          setApplicantProfiles([]);
          setIsApplied(false);
        }
      } catch (error) {
        console.error('Error fetching applicants:', error);
        setApplicantProfiles([]);
      }
      setApplicantsLoading(false);
    };
    if (id) {
      fetchJob();
      fetchApplicants();
    }
  }, [id, user, navigate]);
  useEffect(() => {
    if (job && user) {
      setIsOwner(user.id === job.user_id);
      if (id) {
        const updateApplied = async () => {
          const applicants = await JobApplicantService.getApplicants(id);
          setIsApplied(applicants.some(app => app.user_id === user.id));
        };
        updateApplied();
      }
    }
  }, [job, user, id]);
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('az-AZ', options);
  };
  const handleBack = () => {
    navigate(-1);
  };
  const handleJobUpdated = async () => {
    if (!id) return;
    const updatedJob = await JobService.getJobById(id);
    if (updatedJob) {
      setJob(updatedJob);
      toast({
        title: "İş elanı yeniləndi",
        description: "İş elanı uğurla yeniləndi"
      });
    }
  };
  const handleJobDeleted = () => {
    toast({
      title: "İş elanı silindi",
      description: "İş elanı uğurla silindi"
    });
    navigate('/jobs');
  };
  const handleApplyToJob = async () => {
    if (!id || !user) {
      toast({
        title: "Xəta baş verdi",
        description: "İşə müraciət etmək üçün daxil olmalısınız",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        success,
        error
      } = await JobApplicantService.applyToJob(id);
      if (success) {
        setIsApplied(!isApplied);
        const applicants = await JobApplicantService.getApplicants(id);
        const profiles = await Promise.all(applicants.map(applicant => ProfileService.getProfileById(applicant.user_id)));
        const validProfiles = profiles.filter((profile): profile is ProfileType => profile !== null);
        setApplicantProfiles(validProfiles);
        toast({
          title: isApplied ? "Müraciət ləğv edildi" : "Müraciət edildi",
          description: isApplied ? "İş elanına olan müraciətiniz ləğv edildi" : "İş elanına uğurla müraciət etdiniz"
        });
      } else {
        toast({
          title: "Xəta baş verdi",
          description: error || "Müraciət zamanı xəta baş verdi",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error applying to job:", err);
      toast({
        title: "Xəta baş verdi",
        description: "Müraciət zamanı xəta baş verdi",
        variant: "destructive"
      });
    }
  };
  const navigateToUserProfile = () => {
    if (job?.user_id) {
      navigate(`/profile/${job.user_id}`);
    }
  };
  if (loading) {
    return <div className="page-container flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  if (!job) {
    return <div className="page-container text-center py-12">
        <p className="text-gray-500 mb-4">İş elanı tapılmadı</p>
        <Button onClick={handleBack} variant="outline">Geri qayıt</Button>
      </div>;
  }
  return <div className="page-container pb-20">
      <Button variant="ghost" className="mb-4" onClick={handleBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Geri
      </Button>
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{job?.title}</h1>
          
          {posterProfile && <div onClick={navigateToUserProfile} className="flex items-center mt-3 cursor-pointer hover:text-primary transition-colors py-1.5 px-3 w-fit rounded-xl bg-sky-600 dark:bg-violet-900">
              <Avatar className="w-6 h-6 mr-2">
                <AvatarImage src={posterProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(posterProfile.name || '')}&surname=${encodeURIComponent(posterProfile.surname || '')}&background=0D8ABC&color=fff`} />
                <AvatarFallback>{posterProfile.name?.charAt(0) || ''}{posterProfile.surname?.charAt(0) || ''}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-red-100">
                {posterProfile.name} {posterProfile.surname}
              </span>
            </div>}
          
          <div className="flex items-center gap-4 mt-6 max-w-md bg-gradient-to-r  to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/30 p-4 rounded-xl shadow-sm border border-indigo-200 dark:border-indigo-800/30 animate-fade-in bg-sky-300 dark:bg-violet-950">
            {!isOwner && <Button variant={isApplied ? "secondary" : "default"} onClick={handleApplyToJob} className="flex items-center gap-2 rounded-full px-5 hover:shadow-md transition-all duration-300" disabled={applicantsLoading}>
                <Heart className={`${isApplied ? "fill-current" : ""} transition-all duration-300`} size={18} />
                <span>{isApplied ? "İşə müraciət olundu" : "İşi istəyirəm"}</span>
              </Button>}
            
            {!applicantsLoading && <div className={`${isOwner ? "cursor-pointer hover:scale-105 transition-transform duration-300" : ""} animate-slide-up`} onClick={() => isOwner && setShowAllApplicants(true)}>
                <JobApplicants applicants={applicantProfiles} isOwner={isOwner} showAllApplicants={showAllApplicants} onOpenChange={setShowAllApplicants} />
              </div>}
          </div>
        </div>

        {isOwner && <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Redaktə et
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Sil
            </Button>
          </div>}
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">İş haqqında</h2>
                <Separator className="mb-3" />
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-violet-500" />
                    <span className="font-medium">{job?.company}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-red-500" />
                    <span>{job?.location}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                    <span>Təcrübə: {job?.experience_level || "Göstərilməyib"}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Banknote className="h-5 w-5 mr-2 text-green-500" />
                    <span>Maaş: {job?.salary_range || "Göstərilməyib"}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock3 className="h-5 w-5 mr-2 text-yellow-600" />
                    <span>İş rejimi: {job?.work_mode || "Göstərilməyib"}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Tələblər</h2>
                <Separator className="mb-3" />
                <p className="whitespace-pre-line">{job?.requirements || "Tələblər göstərilməyib"}</p>
              </div>
            </div>
            
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Əlaqə məlumatları</h2>
                <Separator className="mb-3" />
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 text-green-500 mt-0.5" />
                  <p className="whitespace-pre-line">{job?.contact_info || "Əlaqə məlumatları göstərilməyib"}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Müraciət qaydası</h2>
                <Separator className="mb-3" />
                <div className="flex items-start">
                  <FileText className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <p className="whitespace-pre-line">{job?.application_form || "Müraciət qaydası göstərilməyib"}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-2">Elan məlumatları</h2>
                <Separator className="mb-3" />
                <p className="text-sm text-gray-500">
                  Paylaşılma tarixi: {formatDate(job?.created_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isOwner && job && <>
          <EditJobDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} job={job} onJobUpdated={handleJobUpdated} />
          
          <DeleteJobDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} jobId={job.id} jobTitle={job.title} onJobDeleted={handleJobDeleted} />
        </>}
    </div>;
};
export default JobDetail;