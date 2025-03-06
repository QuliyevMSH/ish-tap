
import React, { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AnimatedTransition from './AnimatedTransition';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <AnimatedTransition key={location.key}>
            {children}
          </AnimatedTransition>
        </AnimatePresence>
      </main>
      {!isAuthPage && <BottomNavigation />}
    </div>
  );
};

export default Layout;
