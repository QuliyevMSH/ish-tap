
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 dark:bg-background/90 backdrop-blur-lg border-t border-border shadow-lg bottom-safe-area transition-colors duration-300">
      <div className="flex justify-around items-center h-16 max-w-screen-md mx-auto">
        <Link
          to="/jobs"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full transition-all duration-200",
            path === '/jobs' || path.includes('/jobs/') 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Briefcase className={cn(
            "w-6 h-6 mb-1 transition-transform duration-300",
            (path === '/jobs' || path.includes('/jobs/')) && "scale-110"
          )} />
          <span className="text-xs font-medium">İş</span>
        </Link>
        
        <Link
          to="/profile"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full transition-all duration-200",
            path === '/profile' || path.includes('/profile/') 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className={cn(
            "w-6 h-6 mb-1 transition-transform duration-300",
            (path === '/profile' || path.includes('/profile/')) && "scale-110"
          )} />
          <span className="text-xs font-medium">Profilim</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;
