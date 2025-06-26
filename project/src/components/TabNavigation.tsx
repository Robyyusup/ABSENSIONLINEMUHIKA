import React from 'react';
import { Users, UserCheck, Map, ImageIcon } from 'lucide-react';
import { TabConfig } from '../types';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: TabConfig[] = [
  { id: 'guru-absensi', label: 'Absensi Guru', icon: Users },
  { id: 'siswa-absensi', label: 'Absensi Siswa', icon: UserCheck },
  { id: 'map-siswa', label: 'Peta Siswa', icon: Map },
  { id: 'gallery-siswa', label: 'Galeri Siswa', icon: ImageIcon },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in-up">
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 
              hover-scale button-glow animate-slide-in-left relative overflow-hidden group
              ${isActive 
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' 
                : 'glass-effect text-gray-300 hover:text-white hover:bg-primary-500/10'
              }
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Icon className={`w-5 h-5 mr-2 ${isActive ? 'animate-bounce-subtle' : ''}`} />
            <span className="relative z-10">{tab.label}</span>
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-20 animate-pulse"></div>
            )}
            
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        );
      })}
    </div>
  );
};