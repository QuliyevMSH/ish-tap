import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { JobService } from '@/services/JobService';
import { toast } from '@/components/ui/use-toast';
interface AddJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobAdded: () => void;
}
const AddJobDialog: React.FC<AddJobDialogProps> = ({
  open,
  onOpenChange,
  onJobAdded
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm({
    defaultValues: {
      title: '',
      company: '',
      location: '',
      requirements: '',
      experience_level: '',
      salary_range: '',
      work_mode: '',
      contact_info: '',
      application_form: ''
    }
  });
  const onSubmit = async (data: {
    title: string;
    company: string;
    location: string;
    requirements?: string;
    experience_level?: string;
    salary_range?: string;
    work_mode?: string;
    contact_info?: string;
    application_form?: string;
  }) => {
    try {
      const result = await JobService.addJob(data);
      if (result.success) {
        toast({
          title: "İş əlavə edildi",
          description: "İş elanı uğurla əlavə edildi"
        });
        reset();
        onOpenChange(false);
        onJobAdded();
      } else {
        toast({
          title: "Xəta baş verdi",
          description: result.error || "İş əlavə edilərkən xəta baş verdi",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding job:', error);
      toast({
        title: "Xəta baş verdi",
        description: "İş əlavə edilərkən xəta baş verdi",
        variant: "destructive"
      });
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni iş elanı əlavə et</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Vəzifə adı</Label>
            <Input id="title" placeholder="Məs: Web Proqramçı" {...register('title', {
            required: 'Vəzifə adı tələb olunur'
          })} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Şirkət</Label>
            <Input id="company" placeholder="Məs: Tech Solutions LLC və ya Şəxsi" {...register('company', {
            required: 'Şirkət adı tələb olunur'
          })} />
            {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Məkan</Label>
            <Input id="location" placeholder="Məs: Bakı" {...register('location', {
            required: 'Məkan tələb olunur'
          })} />
            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requirements">İşin tələbləri</Label>
            <Textarea id="requirements" placeholder="İş üçün tələb olunan bacarıqlar, təhsil və s." {...register('requirements')} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="experience_level">Təcrübə səviyyəsi</Label>
            <Input id="experience_level" placeholder="Məs: 1-3 il, Junior, Senior və s." {...register('experience_level')} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="salary_range">Maaş aralığı</Label>
            <Input id="salary_range" placeholder="Məs: 500-1000 AZN, Razılaşma ilə və s." {...register('salary_range')} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="work_mode">İş rejimi</Label>
            <Input id="work_mode" placeholder="Məs: Tam zamanlı, Ev, Ofis" {...register('work_mode')} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_info">Əlaqə nömrəsi</Label>
            <Input id="contact_info" placeholder="Məs: +994 50 123 45 67" {...register('contact_info')} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="application_form">Müraciət forması</Label>
            <Textarea id="application_form" placeholder="Müraciət forması haqqında məlumat" {...register('application_form')} />
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                  Əlavə edilir...
                </> : 'Əlavə et'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>;
};
export default AddJobDialog;