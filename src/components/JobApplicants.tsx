
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileType } from '@/services/ProfileService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';

interface JobApplicantsProps {
  applicants: ProfileType[];
  isOwner: boolean;
  showAllApplicants: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobApplicants: React.FC<JobApplicantsProps> = ({
  applicants,
  isOwner,
  showAllApplicants,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const visibleApplicants = applicants.slice(0, 3);
  const remainingCount = Math.max(0, applicants.length - 3);
  
  const getAvatarUrl = (profile: ProfileType) => {
    if (profile.avatar_url) return profile.avatar_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || '')}&surname=${encodeURIComponent(profile.surname || '')}&background=0D8ABC&color=fff`;
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onOpenChange(false);
  };

  if (showAllApplicants && isOwner) {
    return (
      <Dialog open={showAllApplicants} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşi axtaranların siyahısı</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {applicants.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => handleProfileClick(profile.id)}
              >
                <Avatar>
                  <AvatarImage src={getAvatarUrl(profile)} />
                  <AvatarFallback>{profile.name?.[0]}{profile.surname?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile.name} {profile.surname}</p>
                  {profile.profession && (
                    <p className="text-sm text-gray-500">{profile.profession}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {visibleApplicants.map((profile) => (
          <Avatar key={profile.id} className="border-2 border-white">
            <AvatarImage src={getAvatarUrl(profile)} />
            <AvatarFallback>{profile.name?.[0]}{profile.surname?.[0]}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      {remainingCount > 0 && (
        <span className="text-sm text-gray-500">+{remainingCount} nəfər</span>
      )}
    </div>
  );
};

export default JobApplicants;
