import React from 'react';
import { GraduationCap, BookOpen } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-sm' },
    md: { icon: 'w-8 h-8', text: 'text-lg' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 animate-pulse-slow">
          <GraduationCap className={`${sizeClasses[size].icon} text-primary-400 opacity-50`} />
        </div>
        <GraduationCap className={`${sizeClasses[size].icon} text-primary-500 animate-float`} />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${sizeClasses[size].text} font-bold gradient-text leading-tight`}>
            SMK Muhammadiyah
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Campaka Purwakarta
          </p>
        </div>
      )}
      
      <div className="hidden md:block">
        <BookOpen className="w-4 h-4 text-primary-300 animate-bounce-subtle" />
      </div>
    </div>
  );
};