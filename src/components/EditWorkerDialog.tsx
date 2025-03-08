
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { WorkerService, WorkerType } from '@/services/WorkerService';
import { toast } from '@/components/ui/use-toast';

interface EditWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: WorkerType;
  onWorkerUpdated: () => void;
}

const EditWorkerDialog: React.FC<EditWorkerDialogProps> = ({ 
  open, 
  onOpenChange,
  worker,
  onWorkerUpdated,
}) => {
  const [formData, setFormData] = useState({
    name: worker.name,
    surname: worker.surname,
    profession: worker.profession,
    location: worker.location,
    skills: worker.skills.join(', '), // Convert skills array to comma-separated string
  });
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.surname || !formData.profession || !formData.location) {
      toast({
        title: "Xəta",
        description: "Bütün məcburi sahələri doldurun",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Convert skills string back to array
    const skillsArray = formData.skills.split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== '');
    
    const { success, error } = await WorkerService.updateWorker(worker.id, {
      name: formData.name,
      surname: formData.surname,
      profession: formData.profession,
      location: formData.location,
      skills: skillsArray,
    });
    
    if (success) {
      onOpenChange(false);
      onWorkerUpdated();
    } else {
      toast({
        title: "Xəta baş verdi",
        description: error || "İşçi profili yenilənərkən xəta baş verdi",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>İşçi profilini redaktə et</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Adınız"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="surname">Soyad *</Label>
            <Input
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              placeholder="Soyadınız"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="profession">Peşə *</Label>
            <Input
              id="profession"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              placeholder="Peşəniz"
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
              placeholder="Məkan"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skills">Bacarıqlar (vergüllə ayırın) *</Label>
            <Input
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Məs: JavaScript, React, HTML, CSS"
              required
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

export default EditWorkerDialog;
