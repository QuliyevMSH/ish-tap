
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Briefcase, Settings, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import SearchDialog from './SearchDialog';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background z-50">
      <nav className="flex justify-around items-center h-16 max-w-screen-lg mx-auto">
        <NavLink
          to="/jobs"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center space-y-1 px-4 py-2",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">İşlər</span>
        </NavLink>

        <NavLink
          to="/workers"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center space-y-1 px-4 py-2",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-xs">İşçilər</span>
        </NavLink>

        <div className="flex flex-col items-center justify-center space-y-1 px-4 py-2">
          <SearchDialog trigger={
            <div className="flex flex-col items-center justify-center cursor-pointer">
              <Search className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              <span className="text-xs text-muted-foreground hover:text-foreground">Axtar</span>
            </div>
          } />
        </div>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center space-y-1 px-4 py-2",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <User className="w-5 h-5" />
          <span className="text-xs">Profil</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default BottomNavigation;
