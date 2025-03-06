
import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface TopTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TopTabs: React.FC<TopTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="sticky top-0 z-10 bg-background/80 dark:bg-background/90 backdrop-blur-md transition-colors duration-300">
      <div className="flex justify-around border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "py-3 px-4 text-sm font-medium flex-1 transition-all duration-200",
              activeTab === tab.id
                ? "tab-active"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopTabs;
