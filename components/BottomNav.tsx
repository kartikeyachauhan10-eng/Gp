import React from 'react';
import type { Page } from '../types';
import { Page as PageEnum } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { NewsIcon } from './icons/NewsIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { TideIcon } from './icons/TideIcon';

interface BottomNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  const activeClasses = 'text-cyan-300';
  const inactiveClasses = 'text-gray-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-300';
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 w-full transition-all duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export default function BottomNav({ activePage, setActivePage }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black bg-opacity-40 backdrop-blur-lg border-t border-white/20 z-50 dark:bg-gray-900/60 dark:border-white/10">
      <div className="max-w-screen-md mx-auto h-full flex justify-around items-center px-2">
        <NavItem
          icon={<HomeIcon className="w-6 h-6" />}
          label="Detector"
          isActive={activePage === PageEnum.Detector}
          onClick={() => setActivePage(PageEnum.Detector)}
        />
        <NavItem
          icon={<NewsIcon className="w-6 h-6" />}
          label="News"
          isActive={activePage === PageEnum.News}
          onClick={() => setActivePage(PageEnum.News)}
        />
        <NavItem
          icon={<TideIcon className="w-6 h-6" />}
          label="Tides"
          isActive={activePage === PageEnum.Tides}
          onClick={() => setActivePage(PageEnum.Tides)}
        />
        <NavItem
          icon={<SettingsIcon className="w-6 h-6" />}
          label="Settings"
          isActive={activePage === PageEnum.Settings}
          onClick={() => setActivePage(PageEnum.Settings)}
        />
      </div>
    </nav>
  );
}