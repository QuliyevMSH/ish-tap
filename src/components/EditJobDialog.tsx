
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { JobService, JobType } from '@/services/JobService';
import { toast } from '@/components/ui/use-toast';

interface EditJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobType;
  onJobUpdated: () => void;
}

const EditJobDialog: React.FC<EditJobDialogProps> = ({ 
  open, 
  onOpenChange,
  job,
  onJobUpdated,
}) => {
  const [formData, setFormData] = useState({
    title: job.title,
    company: job.company,
    location: job.location,
    requirements: job.requirements || '',
    experience_level: job.experience_level || '',
    salary_range: job.salary_range || '',
    work_mode: job.work_mode || '',
    contact_info: job.contact_info || '',
    application_form: job.application_form || '',
  });
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.company || !formData.location) {
      toast({
        title: "Xəta",
        description: "Vəzifə, şirkət və məkan mütləq daxil edilməlidir",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    const { success, error } = await JobService.updateJob(job.id, formData);
    
    if (success) {
      onOpenChange(false);
      onJobUpdated();
    } else {
      toast({
        title: "Xəta baş verdi",
        description: error || "İş elanı yenilənərkən xəta baş verdi",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>İş elanını redaktə et</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Vəzifə *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Vəzifə adı"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Şirkət *</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Şirkət adı"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Məkan *</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="İş məkanı"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="experience_level">Təcrübə səviyyəsi</Label>
            <Input
              id="experience_level"
              name="experience_level"
              value={formData.experience_level}
              onChange={handleChange}
              placeholder="Məs: 1-3 il, Entry Level, Senior və s."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="salary_range">Maaş aralığı</Label>
            <Input
              id="salary_range"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              placeholder="Məs: 1500-2500 AZN, Razılaşma ilə və s."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="work_mode">İş rejimi</Label>
            <Input
              id="work_mode"
              name="work_mode"
              value={formData.work_mode}
              onChange={handleChange}
              placeholder="Məs: Tam zamanlı, Hibrid, Uzaqdan və s."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requirements">İşin tələbləri</Label>
            <Textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="İş üçün tələb olunan bacarıqlar, təhsil və s."
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_info">Əlaqə məlumatları</Label>
            <Textarea
              id="contact_info"
              name="contact_info"
              value={formData.contact_info}
              onChange={handleChange}
              placeholder="Email, telefon nömrəsi və s."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="application_form">Müraciət forması</Label>
            <Textarea
              id="application_form"
              name="application_form"
              value={formData.application_form}
              onChange={handleChange}
              placeholder="Müraciət forması haqqında məlumat"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Ləğv et
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yenilənir...
                </span>
              ) : 'Yadda saxla'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditJobDialog;
