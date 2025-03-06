
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { WorkerService } from '@/services/WorkerService';

interface AddWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkerAdded: () => void;
}

const AddWorkerDialog: React.FC<AddWorkerDialogProps> = ({ 
  open, 
  onOpenChange,
  onWorkerAdded
}) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [profession, setProfession] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  
  const resetForm = () => {
    setName('');
    setSurname('');
    setProfession('');
    setSkillsInput('');
    setLocation('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !surname || !profession || !skillsInput || !location) {
      toast({
        title: "Xəta",
        description: "Bütün xanaları doldurun",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Convert skills from comma-separated string to array
    const skills = skillsInput.split(',').map(skill => skill.trim()).filter(Boolean);
    
    try {
      const result = await WorkerService.addWorker({
        name,
        surname,
        profession,
        skills,
        location,
      });
      
      if (result.success) {
        toast({
          title: "Uğurlu!",
          description: "İşçi profili uğurla əlavə edildi",
        });
        resetForm();
        onOpenChange(false);
        onWorkerAdded();
      } else {
        toast({
          title: "Xəta",
          description: result.error || "İşçi profili əlavə edilərkən xəta baş verdi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding worker profile:', error);
      toast({
        title: "Xəta",
        description: "İşçi profili əlavə edilərkən xəta baş verdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>İş axtaran işçi profili əlavə et</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Elşən"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="surname">Soyad</Label>
            <Input 
              id="surname" 
              value={surname} 
              onChange={(e) => setSurname(e.target.value)} 
              placeholder="Məmmədov"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="profession">Peşə</Label>
            <Input 
              id="profession" 
              value={profession} 
              onChange={(e) => setProfession(e.target.value)} 
              placeholder="Web Proqramçı"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skills">Bacarıqlar (vergüllə ayırın)</Label>
            <Input 
              id="skills" 
              value={skillsInput} 
              onChange={(e) => setSkillsInput(e.target.value)} 
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Yer</Label>
            <Input 
              id="location" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="Bakı"
            />
          </div>
          
          <Separator />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Əlavə edilir...
                </>
              ) : (
                'Əlavə et'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkerDialog;
