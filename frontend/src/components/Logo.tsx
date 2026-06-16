import React from 'react';
import { cn } from '@/utils/cn';
import logoImg from '@/assets/logo.png'; // Make sure the file is saved here

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'full';
  showTagline?: boolean;
}

export function Logo({ className, showTagline = false }: LogoProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {/* Using your actual PNG Logo */}
      <img
        src={logoImg}
        alt="TRANZO Logo"
        className="h-16 w-auto object-contain"
      />

      {showTagline && (
        <span className="text-[10px] font-bold text-slate-600 tracking-[0.2em] uppercase mt-[-10px] bg-white px-2">
          Heavy Mobility Solutions
        </span>
      )}
    </div>
  );
}
