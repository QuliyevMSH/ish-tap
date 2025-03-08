
import { supabase } from '@/integrations/supabase/client';

export type FollowerStats = {
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowing: boolean;
};

export const FollowerService = {
  async followUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return { success: false, error: 'User not authenticated' };
      
      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: user.user.id,
          following_id: userId
        });
      
      if (error) {
        // If already following (unique constraint violation)
        if (error.code === '23505') {
          return { success: false, error: 'You are already following this user' };
        }
        throw error;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error following user:', error);
      return { success: false, error: error.message };
    }
  },
  
  async unfollowUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return { success: false, error: 'User not authenticated' };
      
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.user.id)
        .eq('following_id', userId);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      return { success: false, error: error.message };
    }
  },
  
  async getFollowerStats(userId: string): Promise<FollowerStats> {
    try {
      const { data: user } = await supabase.auth.getUser();
      const currentUserId = user.user?.id;
      
      // Use functions with explicit parameter names to avoid ambiguity
      const { data: followerCountData, error: followerCountError } = await supabase
        .rpc('get_follower_count', { user_id: userId });
      
      if (followerCountError) throw followerCountError;
      
      const { data: followingCountData, error: followingCountError } = await supabase
        .rpc('get_following_count', { user_id: userId });
      
      if (followingCountError) throw followingCountError;
      
      // Check if current user is following this user
      let isFollowing = false;
      if (currentUserId && currentUserId !== userId) {
        const { data: isFollowingData, error: isFollowingError } = await supabase
          .rpc('is_following', { 
            follower: currentUserId, 
            following: userId 
          });
        
        if (isFollowingError) throw isFollowingError;
        isFollowing = isFollowingData || false;
      }
      
      return {
        followerCount: followerCountData || 0,
        followingCount: followingCountData || 0,
        postCount: 0, // We're not going to use this, but keeping in type for backward compatibility
        isFollowing: isFollowing
      };
    } catch (error) {
      console.error('Error getting follower stats:', error);
      return {
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
        isFollowing: false
      };
    }
  }
};
