
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './ui/button';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'outline',
  size = 'sm'
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className="flex items-center gap-1 text-foreground"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
};

export default ThemeToggle;
