
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProfileType } from '@/services/ProfileService';
import { ProfileService } from '@/services/ProfileService';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { FollowerService } from '@/services/FollowerService';
import { toast } from '@/components/ui/use-toast';

interface FollowersListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  listType: 'followers' | 'following';
}

const FollowersList: React.FC<FollowersListProps> = ({
  open,
  onOpenChange,
  userId,
  listType
}) => {
  const [users, setUsers] = useState<ProfileType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [followStates, setFollowStates] = useState<{ [key: string]: boolean }>({});
  const [followLoading, setFollowLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      
      try {
        let userIds: string[] = [];
        
        if (listType === 'followers') {
          // Get users that follow this user
          const { data, error } = await supabase
            .from('followers')
            .select('follower_id')
            .eq('following_id', userId);
            
          if (error) throw error;
          userIds = data.map(item => item.follower_id);
        } else {
          // Get users that this user follows
          const { data, error } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', userId);
            
          if (error) throw error;
          userIds = data.map(item => item.following_id);
        }
        
        // Fetch profile data for each user
        if (userIds.length > 0) {
          const profilePromises = userIds.map(id => ProfileService.getProfileById(id));
          const profiles = await Promise.all(profilePromises);
          const validProfiles = profiles.filter((profile): profile is ProfileType => profile !== null);
          setUsers(validProfiles);
          
          // Check if current user is following these users
          if (user) {
            const followChecks = {};
            for (const profile of validProfiles) {
              if (profile.id === user.id) continue; // Skip checking self
              const isFollowing = await FollowerService.getFollowerStats(profile.id);
              followChecks[profile.id] = isFollowing.isFollowing;
            }
            setFollowStates(followChecks);
          }
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      }
      
      setLoading(false);
    };
    
    if (open && userId) {
      fetchUsers();
    }
  }, [open, userId, listType, user]);
  
  const handleProfileClick = (profileId: string) => {
    onOpenChange(false);
    navigate(`/profile/${profileId}`);
  };
  
  const handleFollow = async (profileId: string) => {
    if (!user) {
      toast({
        title: "Giriş edin",
        description: "Təqib etmək üçün hesabınıza giriş edin",
        variant: "destructive",
      });
      return;
    }
    
    setFollowLoading(prev => ({ ...prev, [profileId]: true }));
    
    try {
      if (followStates[profileId]) {
        const result = await FollowerService.unfollowUser(profileId);
        if (result.success) {
          setFollowStates(prev => ({ ...prev, [profileId]: false }));
          toast({
            title: "Təqib ləğv edildi",
            description: "İstifadəçini artıq təqib etmirsiniz",
          });
        } else {
          toast({
            title: "Xəta baş verdi",
            description: result.error || "Təqib ləğv edilmədi",
            variant: "destructive",
          });
        }
      } else {
        const result = await FollowerService.followUser(profileId);
        if (result.success) {
          setFollowStates(prev => ({ ...prev, [profileId]: true }));
          toast({
            title: "Təqib edildi",
            description: "İstifadəçini təqib edirsiniz",
          });
        } else {
          toast({
            title: "Xəta baş verdi",
            description: result.error || "Təqib əlavə olunmadı",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Follow/unfollow error:", error);
      toast({
        title: "Xəta baş verdi",
        description: "Təqib zamanı xəta baş verdi",
        variant: "destructive",
      });
    } finally {
      setFollowLoading(prev => ({ ...prev, [profileId]: false }));
    }
  };
  
  const getAvatarUrl = (profile: ProfileType) => {
    if (profile.avatar_url) return profile.avatar_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || '')}&surname=${encodeURIComponent(profile.surname || '')}&background=0D8ABC&color=fff`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {listType === 'followers' ? 'Təqib edənlər' : 'Təqib edilənlər'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map((profile) => (
                <div 
                  key={profile.id} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                >
                  <div 
                    className="flex items-center flex-1 cursor-pointer"
                    onClick={() => handleProfileClick(profile.id)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={getAvatarUrl(profile)} />
                      <AvatarFallback>{profile.name?.charAt(0) || ''}{profile.surname?.charAt(0) || ''}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profile.name} {profile.surname}</p>
                      {profile.profession && (
                        <p className="text-sm text-muted-foreground">{profile.profession}</p>
                      )}
                    </div>
                  </div>
                  
                  {user && user.id !== profile.id && (
                    <Button 
                      size="sm"
                      variant={followStates[profile.id] ? "secondary" : "default"}
                      onClick={() => handleFollow(profile.id)}
                      disabled={followLoading[profile.id]}
                    >
                      {followLoading[profile.id] ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : followStates[profile.id] ? (
                        <UserCheck className="w-4 h-4 mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      {followStates[profile.id] ? 'Təqib edilir' : 'Təqib et'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {listType === 'followers' ? 'Hələ heç bir təqibçi yoxdur' : 'Hələ heç kimi təqib etmir'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersList;
