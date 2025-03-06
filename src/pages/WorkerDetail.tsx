
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkerService, WorkerType } from '@/services/WorkerService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { User, MapPin, Briefcase, ArrowLeft, Loader2, Calendar, Lightbulb } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

const WorkerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [worker, setWorker] = useState<WorkerType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  
  useEffect(() => {
    const fetchWorker = async () => {
      if (!id) return;
      
      setLoading(true);
      const workerData = await WorkerService.getWorkerById(id);
      
      if (workerData) {
        setWorker(workerData);
        
        // Check if current user is the owner of the worker profile
        if (user && user.id === workerData.user_id) {
          setIsOwner(true);
        }
      } else {
        toast({
          title: "İşçi profili tapılmadı",
          description: "Axtardığınız işçi profili mövcud deyil və ya silinib",
          variant: "destructive",
        });
        navigate('/jobs');
      }
      
      setLoading(false);
    };
    
    fetchWorker();
  }, [id, user, navigate]);
  
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

  const navigateToUserProfile = () => {
    if (worker?.user_id) {
      navigate(`/profile/${worker.user_id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="page-container flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!worker) {
    return (
      <div className="page-container text-center py-12">
        <p className="text-gray-500 mb-4">İşçi profili tapılmadı</p>
        <Button onClick={handleBack} variant="outline">Geri qayıt</Button>
      </div>
    );
  }
  
  return (
    <div className="page-container pb-20">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Geri
      </Button>
      
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-2xl font-bold">{`${worker.name} ${worker.surname}`}</h1>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">İşçi haqqında</h2>
                <Separator className="mb-3" />
                
                <div className="space-y-3">
                  <div 
                    className="flex items-center cursor-pointer hover:text-primary transition-colors"
                    onClick={navigateToUserProfile}
                  >
                    <User className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium underline">{`${worker.name} ${worker.surname}`}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{worker.profession}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{worker.location}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Qeydiyyat tarixi: {formatDate(worker.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Bacarıqlar</h2>
                <Separator className="mb-3" />
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="font-normal text-sm py-1">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Profil məlumatları</h2>
                <Separator className="mb-3" />
                <p className="text-sm text-gray-500">
                  Paylaşılma tarixi: {formatDate(worker.created_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerDetail;
