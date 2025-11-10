
import React, { useState, useCallback, useEffect } from 'react';
import Detector from './components/Detector';
import News from './components/News';
import Settings from './components/Settings';
import Tides from './components/Tides';
import BottomNav from './components/BottomNav';
import type { Profile } from './types';
import { Page } from './types';

const SeaAnimal: React.FC<{ emoji: string; className: string }> = ({ emoji, className }) => (
  <div className={`absolute text-3xl md:text-5xl opacity-50 ${className}`}>
    {emoji}
  </div>
);

export default function App() {
  const [activePage, setActivePage] = useState<Page>(Page.Detector);
  const [profile, setProfile] = useState<Profile>({
    name: 'Aqua User',
    picture: null,
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = storedTheme || preferredTheme;
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeChange = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleProfileChange = useCallback((newProfile: Profile) => {
    setProfile(newProfile);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case Page.News:
        return <News />;
      case Page.Tides:
        return <Tides />;
      case Page.Settings:
        return <Settings profile={profile} onProfileChange={handleProfileChange} theme={theme} onThemeChange={handleThemeChange} />;
      case Page.Detector:
      default:
        return <Detector />;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-blue-300 via-blue-500 to-indigo-800 dark:from-gray-800 dark:via-gray-900 dark:to-black text-white overflow-hidden transition-colors duration-500">
      {/* Background Sea Animals */}
      <SeaAnimal emoji="🐠" className="top-[10%] left-[5%] animate-pulse" />
      <SeaAnimal emoji="🐙" className="top-[20%] right-[10%] animate-bounce" />
      <SeaAnimal emoji="🐢" className="bottom-[25%] left-[15%] animate-pulse delay-500" />
      <SeaAnimal emoji="🐳" className="bottom-[15%] right-[20%] animate-bounce delay-300" />
      <SeaAnimal emoji="🦀" className="top-[50%] left-[8%] animate-pulse delay-200" />
      <SeaAnimal emoji="🐬" className="top-[70%] right-[5%] animate-bounce" />

      <main className="relative z-10 flex flex-col h-screen">
        <header className="flex-shrink-0 p-4 bg-black bg-opacity-20 backdrop-blur-sm shadow-lg dark:bg-opacity-30">
          <h1 className="text-2xl font-bold text-center tracking-wider">Aqua Sentinel</h1>
        </header>

        <div className="flex-grow overflow-y-auto p-4 md:p-6 pb-24">
          {renderPage()}
        </div>
        
        {isOffline && (
            <div className="fixed bottom-20 left-0 right-0 bg-yellow-500 text-black text-center p-2 z-[60] text-sm font-semibold shadow-lg animate-fade-in">
                You are currently offline. Displayed content may be outdated.
            </div>
        )}

        <BottomNav activePage={activePage} setActivePage={setActivePage} />
      </main>
    </div>
  );
}
