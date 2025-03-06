
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { JobService } from '@/services/JobService';
import { toast } from '@/components/ui/use-toast';

interface DeleteJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  onJobDeleted: () => void;
}

const DeleteJobDialog: React.FC<DeleteJobDialogProps> = ({ 
  open, 
  onOpenChange,
  jobId,
  jobTitle,
  onJobDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  
  const handleDelete = async () => {
    setLoading(true);
    
    const { success, error } = await JobService.deleteJob(jobId);
    
    if (success) {
      onOpenChange(false);
      onJobDeleted();
    } else {
      toast({
        title: "Xəta baş verdi",
        description: error || "İş elanı silinərkən xəta baş verdi",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>İş elanını sil</DialogTitle>
          <DialogDescription>
            "{jobTitle}" adlı iş elanını silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Ləğv et
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Silinir...
              </span>
            ) : 'Sil'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteJobDialog;
