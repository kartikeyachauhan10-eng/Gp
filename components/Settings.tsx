import React, { useState, useRef, useEffect } from 'react';
import type { Profile } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';


interface SettingsProps {
  profile: Profile;
  onProfileChange: (newProfile: Profile) => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}

const DarkModeToggle: React.FC<{ theme: 'light' | 'dark'; onThemeChange: () => void }> = ({ theme, onThemeChange }) => {
  return (
    <button
      onClick={onThemeChange}
      className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800 ${
        theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-600'
      }`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <SunIcon className="w-5 h-5 text-yellow-300" />
      </span>
       <span
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <MoonIcon className="w-5 h-5 text-gray-300" />
      </span>
      <span
        className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ${
          theme === 'dark' ? 'translate-x-9' : 'translate-x-1'
        }`}
      />
    </button>
  );
};


export default function Settings({ profile, onProfileChange, theme, onThemeChange }: SettingsProps) {
  const [name, setName] = useState(profile.name);
  const [picture, setPicture] = useState(profile.picture);
  
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile.name);
    setPicture(profile.picture);
  }, [profile]);

  useEffect(() => {
    if (name !== profile.name || picture !== profile.picture) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [name, picture, profile]);

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = () => {
    onProfileChange({ name, picture });
    setIsEditing(false);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center animate-fade-in max-w-lg mx-auto gap-8">
      <h2 className="text-3xl font-bold text-center">Settings</h2>

      {/* Profile Settings */}
      <div className="w-full p-6 bg-black bg-opacity-30 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:bg-gray-900/40 dark:border-white/10">
        <h3 className="text-xl font-semibold mb-6 text-center text-cyan-300">User Profile</h3>
        <div className="flex flex-col items-center gap-6">
          <div className="relative group cursor-pointer" onClick={triggerFileSelect}>
            {picture ? (
              <img src={picture} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-cyan-400 shadow-lg" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center border-4 border-cyan-400 shadow-lg">
                <UserIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300">
              <span className="text-white opacity-0 group-hover:opacity-100 font-semibold">Change</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handlePictureChange} className="hidden" accept="image/*" />

          <div className="w-full">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 dark:text-gray-400 mb-2">Profile Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition dark:bg-gray-800 dark:border-gray-600"
              placeholder="Enter your name"
            />
          </div>
        </div>
      </div>
      
      {/* Appearance Settings */}
      <div className="w-full p-6 bg-black bg-opacity-30 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:bg-gray-900/40 dark:border-white/10">
        <h3 className="text-xl font-semibold mb-4 text-center text-cyan-300">Appearance</h3>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-200 dark:text-gray-300">Dark Mode</span>
          <DarkModeToggle theme={theme} onThemeChange={onThemeChange} />
        </div>
      </div>
      
      {isEditing && (
        <button
          onClick={handleSave}
          className="w-full max-w-md px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 dark:bg-cyan-600 dark:hover:bg-cyan-700"
        >
          Save Changes
        </button>
      )}
    </div>
  );
}